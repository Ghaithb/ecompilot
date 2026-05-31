import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventBusService } from '../../core/events/event-bus.service';
import { DomainEvents } from '../../core/events/domain-events.constants';
import { Cart, CartDocument, CartItem, ShippingQuoteEntry } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';
import { ConversionExperimentService } from '../conversion-intelligence/conversion-experiment.service';

type CartIdentity = {
  tenantId: string;
  userId?: string;
  sessionId?: string;
};

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
    private readonly config: ConfigService,
    private readonly events: EventBusService,
    private readonly experiments: ConversionExperimentService,
  ) {}

  private cartFilter(identity: CartIdentity) {
    const base: Record<string, unknown> = { tenantId: identity.tenantId, status: 'active' };
    if (identity.userId) base.userId = identity.userId;
    else if (identity.sessionId) base.sessionId = identity.sessionId;
    else throw new BadRequestException('userId ou sessionId requis');
    return base;
  }

  async getOrCreateCart(identity: CartIdentity): Promise<CartDocument> {
    let cart = await this.cartModel.findOne(this.cartFilter(identity));

    if (!cart) {
      const sessionKey = identity.userId || identity.sessionId || 'anon';
      const variants = this.experiments.assign(identity.tenantId, sessionKey);
      cart = await this.cartModel.create({
        ...identity,
        ...variants,
        items: [],
        totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
        currency: 'TND',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        lastActivityAt: new Date(),
        recoveryRemindersSent: 0,
        recoveryStage: 0,
      });
      this.events.publishSync(DomainEvents.CART_CREATED, {
        tenantId: identity.tenantId,
        cartId: cart._id.toString(),
        sessionId: identity.sessionId,
        userId: identity.userId,
        itemCount: 0,
        total: 0,
      });
    }

    return cart;
  }

  private async touchActivity(cart: CartDocument) {
    cart.lastActivityAt = new Date();
    cart.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await cart.save();
  }

  async addItem(
    identity: CartIdentity,
    productId: string,
    quantity: number,
    options?: Record<string, unknown>,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    const product = await this.productsService.findOne(identity.tenantId, productId);
    if (!product) throw new NotFoundException('Produit introuvable');

    if (product.variants?.length) {
      const totalInventory = product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0);
      if (totalInventory < quantity) throw new BadRequestException('Stock insuffisant');
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.options) === JSON.stringify(options),
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal =
        cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      const firstVariant = product.variants?.[0];
      const newItem: CartItem = {
        productId: new Types.ObjectId(productId),
        name: product.title,
        price: firstVariant?.price || 0,
        quantity,
        image: product.images?.[0],
        sku: firstVariant?.sku || '',
        options,
        subtotal: (firstVariant?.price || 0) * quantity,
      };
      cart.items.push(newItem as CartItem);
    }

    await this.recalculateTotals(cart);
    cart.lastActivityAt = new Date();
    const saved = await cart.save();
    this.emitCartUpdated(saved, identity);
    return saved;
  }

  private emitCartUpdated(cart: CartDocument, identity: CartIdentity) {
    this.events.publishSync(DomainEvents.CART_UPDATED, {
      tenantId: identity.tenantId,
      cartId: cart._id.toString(),
      sessionId: identity.sessionId,
      userId: identity.userId,
      itemCount: cart.items.length,
      total: cart.totals?.total,
    });
  }

  async updateQuantity(
    identity: CartIdentity,
    productId: string,
    quantity: number,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) throw new NotFoundException('Produit non trouvé dans le panier');

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await this.productsService.findOne(identity.tenantId, productId);
      if (product?.variants?.length) {
        const totalInventory = product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0);
        if (totalInventory < quantity) throw new BadRequestException('Stock insuffisant');
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
    }

    await this.recalculateTotals(cart);
    cart.lastActivityAt = new Date();
    return cart.save();
  }

  async removeItem(identity: CartIdentity, productId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await this.recalculateTotals(cart);
    cart.lastActivityAt = new Date();
    return cart.save();
  }

  async clearCart(identity: CartIdentity): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    cart.items = [];
    await this.recalculateTotals(cart);
    cart.lastActivityAt = new Date();
    return cart.save();
  }

  async applyCoupon(identity: CartIdentity, couponCode: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    const code = couponCode.toUpperCase();

    if (code === 'PROMO10' || code === 'RECOVERY10') {
      cart.couponCode = code;
      cart.couponDiscount = cart.totals.subtotal * 0.1;
    } else if (code === 'PROMO20') {
      cart.couponCode = code;
      cart.couponDiscount = cart.totals.subtotal * 0.2;
    } else {
      throw new BadRequestException('Code promo invalide');
    }

    await this.recalculateTotals(cart);
    cart.lastActivityAt = new Date();
    return cart.save();
  }

  async removeCoupon(identity: CartIdentity): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    await this.recalculateTotals(cart);
    return cart.save();
  }

  async syncSessionCart(
    tenantId: string,
    sessionId: string,
    data: {
      items: Array<{ productId: string; name: string; price: number; quantity: number; image?: string }>;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      storeSlug?: string;
    },
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart({ tenantId, sessionId });
    cart.items = data.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      subtotal: item.price * item.quantity,
    })) as CartItem[];

    if (data.customerName) cart.customerName = data.customerName;
    if (data.customerPhone) cart.customerPhone = data.customerPhone;
    if (data.customerEmail) cart.customerEmail = data.customerEmail;
    if (data.storeSlug) cart.storeSlug = data.storeSlug;

    await this.recalculateTotals(cart);
    cart.lastActivityAt = new Date();
    return cart.save();
  }

  applyShippingQuote(cart: CartDocument, quotes: ShippingQuoteEntry[], best?: ShippingQuoteEntry) {
    cart.shippingQuotes = quotes;
    cart.selectedShipping = best || quotes[0];
    if (cart.selectedShipping) {
      cart.estimatedDeliveryAt = new Date(
        Date.now() + cart.selectedShipping.estimatedDays * 24 * 60 * 60 * 1000,
      );
    }
  }

  async recalculateTotals(cart: CartDocument): Promise<void> {
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = 0;
    const freeThreshold = this.config.get<number>('cart.freeShippingThreshold') || 150;
    const defaultShipping = this.config.get<number>('cart.defaultShippingTnd') || 7;
    const shipping =
      cart.selectedShipping?.rate ??
      (subtotal >= freeThreshold ? 0 : defaultShipping);
    const discount = cart.couponDiscount || 0;
    const total = Math.max(0, subtotal + tax + shipping - discount);

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  async getCart(userId: string, tenantId: string): Promise<CartDocument> {
    return this.getOrCreateCart({ userId, tenantId });
  }

  async getSessionCart(tenantId: string, sessionId: string): Promise<CartDocument> {
    return this.getOrCreateCart({ tenantId, sessionId });
  }

  async convertToOrder(identity: CartIdentity, fromRecovery = false): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(identity);
    cart.status = 'converted';
    if (fromRecovery) {
      cart.recoveredFromAbandonment = true;
      cart.recoveredAt = new Date();
    }
    return cart.save();
  }

  async markAsAbandoned(cart: CartDocument): Promise<CartDocument> {
    if (cart.status !== 'active' || cart.items.length === 0) return cart;
    cart.status = 'abandoned';
    cart.abandonedAt = new Date();
    const saved = await cart.save();
    this.events.publishSync(DomainEvents.CART_ABANDONED, {
      tenantId: cart.tenantId,
      cartId: cart._id.toString(),
      sessionId: cart.sessionId,
      userId: cart.userId,
      total: cart.totals?.total,
      itemCount: cart.items.length,
    });
    return saved;
  }

  async listAbandoned(tenantId: string, limit = 50) {
    return this.cartModel
      .find({ tenantId, status: 'abandoned' })
      .sort({ abandonedAt: -1 })
      .limit(limit)
      .lean();
  }

  async getAbandonedStats(tenantId: string) {
    const [total, recovered, pending] = await Promise.all([
      this.cartModel.countDocuments({ tenantId, status: 'abandoned' }),
      this.cartModel.countDocuments({ tenantId, status: 'converted' }),
      this.cartModel.countDocuments({
        tenantId,
        status: 'abandoned',
        recoveryRemindersSent: { $lt: this.config.get<number>('cart.recoveryMaxReminders') || 2 },
      }),
    ]);
    const carts = await this.cartModel
      .find({ tenantId, status: 'abandoned' })
      .select('totals.total recoveryRemindersSent')
      .lean();
    const recoverableRevenue = carts.reduce((s, c) => s + (c.totals?.total || 0), 0);
    return {
      total,
      recovered,
      pending,
      recoverableRevenue: Math.round(recoverableRevenue * 100) / 100,
      recoveryRate: total ? Math.round((recovered / (total + recovered)) * 100) : 0,
    };
  }

  async cleanExpiredCarts(): Promise<number> {
    const result = await this.cartModel.deleteMany({ expiresAt: { $lt: new Date() } });
    this.logger.log(`Supprimé ${result.deletedCount} paniers expirés`);
    return result.deletedCount;
  }
}
