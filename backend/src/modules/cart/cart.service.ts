import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument, CartItem } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Récupérer ou créer un panier
   */
  async getOrCreateCart(userId: string, tenantId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId, tenantId, status: 'active' });

    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        tenantId,
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        status: 'active',
      });
    }

    return cart;
  }

  /**
   * Ajouter un produit au panier
   */
  async addItem(
    userId: string,
    tenantId: string,
    productId: string,
    quantity: number,
    options?: Record<string, any>,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);

    // Vérifier que le produit existe et est disponible
    const product = await this.productsService.findOne(tenantId, productId);
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    // Vérifier le stock si variants disponibles
    if (product.variants && product.variants.length > 0) {
      const totalInventory = product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0);
      if (totalInventory < quantity) {
        throw new BadRequestException('Stock insuffisant');
      }
    }

    // Vérifier si le produit existe déjà dans le panier
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && 
                JSON.stringify(item.options) === JSON.stringify(options),
    );

    if (existingItemIndex > -1) {
      // Mettre à jour la quantité
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal = 
        cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Ajouter un nouveau produit
      const firstVariant = product.variants?.[0];
      const newItem: CartItem = {
        productId: (product as any)._id,
        name: product.title,
        price: firstVariant?.price || 0,
        quantity,
        image: product.images?.[0],
        sku: firstVariant?.sku || '',
        options,
        subtotal: (firstVariant?.price || 0) * quantity,
      };
      cart.items.push(newItem as any);
    }

    await this.recalculateTotals(cart);
    return await cart.save();
  }

  /**
   * Mettre à jour la quantité d'un produit
   */
  async updateQuantity(
    userId: string,
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Produit non trouvé dans le panier');
    }

    if (quantity <= 0) {
      // Retirer le produit si quantité = 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Vérifier le stock (si variants disponibles)
      const product = await this.productsService.findOne(tenantId, productId);
      if (product.variants && product.variants.length > 0) {
        const totalInventory = product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0);
        if (totalInventory < quantity) {
          throw new BadRequestException('Stock insuffisant');
        }
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
    }

    await this.recalculateTotals(cart);
    return await cart.save();
  }

  /**
   * Retirer un produit du panier
   */
  async removeItem(
    userId: string,
    tenantId: string,
    productId: string,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await this.recalculateTotals(cart);
    return await cart.save();
  }

  /**
   * Vider le panier
   */
  async clearCart(userId: string, tenantId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);
    cart.items = [];
    await this.recalculateTotals(cart);
    return await cart.save();
  }

  /**
   * Appliquer un code promo
   */
  async applyCoupon(
    userId: string,
    tenantId: string,
    couponCode: string,
  ): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);

    // TODO: Vérifier le code promo dans une table coupons
    // Pour l'instant, code de test: "PROMO10" = 10% de réduction
    if (couponCode === 'PROMO10') {
      cart.couponCode = couponCode;
      cart.couponDiscount = cart.totals.subtotal * 0.1;
    } else if (couponCode === 'PROMO20') {
      cart.couponCode = couponCode;
      cart.couponDiscount = cart.totals.subtotal * 0.2;
    } else {
      throw new BadRequestException('Code promo invalide');
    }

    await this.recalculateTotals(cart);
    return await cart.save();
  }

  /**
   * Retirer le code promo
   */
  async removeCoupon(userId: string, tenantId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);
    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    await this.recalculateTotals(cart);
    return await cart.save();
  }

  /**
   * Recalculer les totaux du panier
   */
  private async recalculateTotals(cart: CartDocument): Promise<void> {
    // Calculer le sous-total
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculer les taxes (exemple: 20%)
    const taxRate = 0.20; // À récupérer depuis la config du site
    const tax = subtotal * taxRate;

    // Calculer les frais de livraison
    const shipping = this.calculateShipping(subtotal);

    // Appliquer les réductions
    const discount = cart.couponDiscount || 0;

    // Calculer le total
    const total = subtotal + tax + shipping - discount;

    cart.totals = {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Calculer les frais de livraison
   */
  private calculateShipping(subtotal: number): number {
    // Livraison gratuite au-dessus de 50€
    if (subtotal >= 50) {
      return 0;
    }
    // Sinon 5€
    return 5.0;
  }

  /**
   * Récupérer le panier actuel
   */
  async getCart(userId: string, tenantId: string): Promise<CartDocument> {
    return this.getOrCreateCart(userId, tenantId);
  }

  /**
   * Convertir le panier en commande (utilisé après paiement)
   */
  async convertToOrder(userId: string, tenantId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);
    cart.status = 'converted';
    return await cart.save();
  }

  /**
   * Marquer un panier comme abandonné (pour remarketing)
   */
  async markAsAbandoned(userId: string, tenantId: string): Promise<CartDocument> {
    const cart = await this.getOrCreateCart(userId, tenantId);
    cart.status = 'abandoned';
    return await cart.save();
  }

  /**
   * Nettoyer les paniers expirés
   */
  async cleanExpiredCarts(): Promise<number> {
    const result = await this.cartModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    this.logger.log(`Supprimé ${result.deletedCount} paniers expirés`);
    return result.deletedCount;
  }
}
