import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../../core/events/event-bus.service';
import { DomainEvents } from '../../core/events/domain-events.constants';
import { DeliveryOrderContext } from '../delivery/interfaces/delivery-provider.interface';
import { DeliveryService } from '../delivery/services/delivery.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { CheckoutOptimizationService } from '../conversion-intelligence/checkout-optimization.service';
import { ConversionIntelligenceService } from '../conversion-intelligence/conversion-intelligence.service';
import { normalizePhone, isValidPhone } from '../../common/utils/phone.util';
import { CheckoutAddressDto } from './dto/checkout.dto';
import { CartDocument } from './schemas/cart.schema';
import { CartService } from './cart.service';

@Injectable()
export class CartCheckoutService {
  private readonly logger = new Logger(CartCheckoutService.name);

  constructor(
    private cartService: CartService,
    private delivery: DeliveryService,
    private orders: OrdersService,
    private products: ProductsService,
    private optimization: CheckoutOptimizationService,
    private intelligence: ConversionIntelligenceService,
    private events: EventBusService,
  ) {}

  async startCheckout(tenantId: string, cart: CartDocument, userId?: string, deviceType?: string) {
    cart.checkoutStartedAt = new Date();
    cart.checkoutStepReached = Math.max(cart.checkoutStepReached || 0, 1);
    if (deviceType === 'mobile' || deviceType === 'desktop') {
      cart.deviceType = deviceType;
    }
    cart.paymentMethod = cart.paymentMethod || 'cod';
    cart.codPreferred = true;
    await cart.save();

    const intel = this.intelligence.analyzeCart(cart, {
      checkoutStarted: true,
      checkoutStep: cart.checkoutStepReached,
      deviceType: cart.deviceType as 'mobile' | 'desktop' | 'unknown',
      paymentMethod: cart.paymentMethod,
    });
    this.intelligence.appendScoreHistory(cart, intel);
    await cart.save();

    this.events.publishSync(DomainEvents.CHECKOUT_STARTED, {
      tenantId,
      cartId: cart._id.toString(),
      sessionId: cart.sessionId,
      userId,
      checkoutVersion: (cart.checkoutVersion as 'A' | 'B') || 'A',
      total: cart.totals?.total,
      checkoutStep: cart.checkoutStepReached,
      deviceType: cart.deviceType,
      paymentMethod: cart.paymentMethod,
      frictionFlags: intel.frictionFlags,
    });
    return intel;
  }

  async trackCheckoutStep(
    tenantId: string,
    cart: CartDocument,
    dto: { step: number; deviceType?: string; paymentMethod?: string; address?: CheckoutAddressDto },
  ) {
    cart.checkoutStepReached = Math.max(cart.checkoutStepReached || 0, dto.step);
    if (dto.deviceType === 'mobile' || dto.deviceType === 'desktop') {
      cart.deviceType = dto.deviceType;
    }
    if (dto.paymentMethod) cart.paymentMethod = dto.paymentMethod;
    if (dto.address?.phone) cart.customerPhone = normalizePhone(dto.address.phone);
    if (dto.address?.fullName) cart.customerName = dto.address.fullName;

    const intel = this.intelligence.analyzeCart(cart, {
      checkoutStarted: true,
      checkoutStep: cart.checkoutStepReached,
      deviceType: cart.deviceType as 'mobile' | 'desktop' | 'unknown',
      paymentMethod: cart.paymentMethod,
    });
    this.intelligence.appendScoreHistory(cart, intel);
    await cart.save();

    const prediction = this.optimization.predictCheckoutAbandonment(cart, dto.address);
    return { intelligence: intel, ...prediction };
  }

  async predictAbandonment(tenantId: string, cart: CartDocument, address?: CheckoutAddressDto) {
    return this.optimization.predictCheckoutAbandonment(cart, address);
  }

  async getQuote(
    tenantId: string,
    cart: CartDocument,
    address?: CheckoutAddressDto,
    weightKg?: number,
  ) {
    const cacheKey = this.optimization.cacheKey(
      tenantId,
      cart._id.toString(),
      address?.governorate,
    );
    const cached = this.optimization.getCachedQuote(cacheKey);
    if (cached) return cached;

    const qty = cart.items.reduce((s, i) => s + i.quantity, 0) || 1;
    const ctx: DeliveryOrderContext = {
      orderId: 'quote',
      orderNumber: 'QUOTE',
      tenantId,
      customerName: address?.fullName || cart.customerName || 'Client',
      customerPhone: address?.phone || cart.customerPhone || '20000000',
      customerEmail: address?.email || cart.customerEmail,
      address: address?.address || 'Tunis',
      city: [address?.delegation, address?.governorate].filter(Boolean).join(', ') || 'Tunis',
      province: address?.governorate || 'Tunis',
      country: address?.country || 'TN',
      weightKg: weightKg ?? Math.max(0.5, qty * 0.3),
      codAmount: cart.totals?.total,
      currency: 'TND',
      total: cart.totals?.total || 0,
      lineItems: cart.items.map((i) => ({
        title: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    const quotes = await this.delivery.quoteCheckoutRates(tenantId, ctx);
    this.cartService.applyShippingQuote(cart, quotes.rates, quotes.best);
    await this.cartService.recalculateTotals(cart);
    await cart.save();

    const intel = this.intelligence.analyzeCart(cart, {
      checkoutStarted: Boolean(cart.checkoutStartedAt),
      checkoutStep: cart.checkoutStepReached,
      deviceType: cart.deviceType as 'mobile' | 'desktop' | 'unknown',
      paymentMethod: cart.paymentMethod,
    });
    const uiHints = this.optimization.buildQuoteUiHints(cart, quotes.rates.length);
    const payload = {
      shipping: cart.totals.shipping,
      totals: cart.totals,
      quotes: quotes.rates,
      best: quotes.best,
      estimatedDeliveryAt: cart.estimatedDeliveryAt,
      deliveryConfidence: uiHints.deliveryConfidence,
      intelligence: intel,
      optimization: uiHints,
      trust: this.trustLayer(),
    };
    this.optimization.setCachedQuote(cacheKey, payload);
    return payload;
  }

  trustLayer() {
    return {
      badges: [
        { id: 'cod', label: 'Paiement à la livraison', icon: 'truck' },
        { id: 'secure', label: 'Commande sécurisée SMS', icon: 'shield' },
        { id: 'fast', label: 'Livraison 24-72h', icon: 'clock' },
        { id: 'guarantee', label: 'Garantie livraison limitée', icon: 'badge' },
      ],
      codTrust: {
        headline: 'Paiement à la livraison — zéro risque',
        bullets: [
          'Payez uniquement à réception',
          'Confirmation SMS avant expédition',
          'Support client réactif',
        ],
      },
    };
  }

  private productIdOf(product: Record<string, unknown>): string {
    if (typeof product.id === 'string') return product.id;
    const id = product._id as { toString(): string } | undefined;
    return id?.toString?.() || String(product._id);
  }

  async getUpsells(tenantId: string, productIds: string[], strategy: 'auto' | 'upsell' | 'cross_sell' = 'auto') {
    if (!productIds.length) return [];

    const allProducts = await this.products.findByTenant(tenantId);
    const inCart = new Set(productIds);
    const sourceProducts = allProducts.filter((p) =>
      inCart.has(this.productIdOf(p as unknown as Record<string, unknown>)),
    );

    const recommendations = new Map<string, { type: 'upsell' | 'cross_sell'; reason: string; score: number }>();
    for (const product of sourceProducts) {
      const meta = (product.metadata || {}) as Record<string, unknown>;
      const configured = meta.upsellProductIds as string[] | undefined;
      if (configured?.length) {
        configured.forEach((id, index) =>
          recommendations.set(id, {
            type: 'upsell',
            reason: 'Offre configuree pour ce produit',
            score: 100 - index,
          }),
        );
      }

      if (product.category && strategy !== 'upsell') {
        allProducts
          .filter(
            (p) =>
              p.category === product.category &&
              !inCart.has(this.productIdOf(p as unknown as Record<string, unknown>)) &&
              p.status === 'active',
          )
          .slice(0, 2)
          .forEach((p, index) => {
            const id = this.productIdOf(p as unknown as Record<string, unknown>);
            if (!recommendations.has(id)) {
              recommendations.set(id, {
                type: 'cross_sell',
                reason: `Complement populaire en ${product.category}`,
                score: 80 - index,
              });
            }
          });
      }
    }

    return allProducts
      .filter((p) => {
        const id = this.productIdOf(p as unknown as Record<string, unknown>);
        if (!recommendations.has(id)) return false;
        const inventory = p.variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0;
        return p.status === 'active' && inventory > 0;
      })
      .sort((a, b) => {
        const aId = this.productIdOf(a as unknown as Record<string, unknown>);
        const bId = this.productIdOf(b as unknown as Record<string, unknown>);
        return (recommendations.get(bId)?.score || 0) - (recommendations.get(aId)?.score || 0);
      })
      .slice(0, 4)
      .map((p) => {
        const id = this.productIdOf(p as unknown as Record<string, unknown>);
        const recommendation = recommendations.get(id);
        const inventory = p.variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0;
        return {
        id,
        title: p.title,
        price: p.variants?.[0]?.price || 0,
        compareAtPrice: p.variants?.[0]?.compareAtPrice || 0,
        image: p.images?.[0],
        category: p.category,
        inStock: inventory > 0,
        stock: inventory,
        recommendationType: recommendation?.type || 'cross_sell',
        reason: recommendation?.reason || 'Produit recommande',
        score: recommendation?.score || 50,
      };
      });
  }

  async getFunnelOffers(tenantId: string, productIds: string[], subtotal = 0) {
    const freeShippingThreshold = 150;
    const offers = await this.getUpsells(tenantId, productIds, 'auto');
    const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

    return {
      productIds,
      subtotal,
      freeShipping: {
        threshold: freeShippingThreshold,
        missing: Math.round(missingForFreeShipping * 100) / 100,
        unlocked: missingForFreeShipping === 0,
      },
      upsells: offers.filter((offer) => offer.recommendationType === 'upsell'),
      crossSells: offers.filter((offer) => offer.recommendationType === 'cross_sell'),
      nextBestOffer: offers[0] || null,
      playbook: [
        missingForFreeShipping > 0 && missingForFreeShipping <= 80
          ? `Proposer un produit autour de ${missingForFreeShipping.toFixed(0)} TND pour debloquer la livraison`
          : null,
        offers[0] ? `Mettre "${offers[0].title}" dans le panier secondaire` : null,
        offers.length > 1 ? 'Afficher 2 choix max pour eviter la friction checkout' : null,
      ].filter(Boolean),
    };
  }

  async submitCheckout(
    tenantId: string,
    cart: CartDocument,
    address: CheckoutAddressDto,
    identity: { userId?: string; sessionId?: string },
  ) {
    if (!cart.items.length) throw new BadRequestException('Panier vide');

    if (!isValidPhone(address.phone)) {
      throw new BadRequestException('Numéro de téléphone invalide');
    }

    const phone = normalizePhone(address.phone);
    const nameParts = address.fullName.trim().split(/\s+/);
    const orderNumber = `ECP-${Date.now().toString(36).toUpperCase()}`;

    if (!cart.selectedShipping) {
      await this.getQuote(tenantId, cart, address);
    }

    const shippingAddress = {
      firstName: nameParts[0] || 'Client',
      lastName: nameParts.slice(1).join(' ') || '-',
      address1: address.address,
      city: address.delegation || address.governorate,
      province: address.governorate,
      country: address.country || 'TN',
      zip: '1000',
      phone,
    };

    const orderPayload = {
      orderNumber,
      shippingAddress,
      billingAddress: { ...shippingAddress },
      customerEmail:
        address.email || `${phone.replace('+', '')}@guest.ecompilot.local`,
      lineItems: cart.items.map((item) => ({
        productId: item.productId.toString(),
        variantId: 'default',
        title: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.subtotal,
      })),
      subtotal: cart.totals.subtotal,
      total: cart.totals.total,
      shippingCost: cart.totals.shipping,
      currency: 'TND',
      paymentMethod: 'cod',
      status: 'pending',
      shippingProvider: cart.selectedShipping?.provider,
      metadata: {
        cartId: cart._id.toString(),
        sessionId: identity.sessionId,
        estimatedDeliveryAt: cart.estimatedDeliveryAt,
      },
    };

    const order = await this.orders.create(orderPayload, tenantId);
    const wasAbandoned = cart.status === 'abandoned';

    cart.customerName = address.fullName;
    cart.customerPhone = phone;
    cart.customerEmail = orderPayload.customerEmail;
    await this.cartService.convertToOrder(
      identity.userId
        ? { userId: identity.userId, tenantId }
        : { sessionId: identity.sessionId!, tenantId },
      wasAbandoned,
    );

    if (wasAbandoned) {
      this.events.publishSync(DomainEvents.CART_RECOVERED, {
        tenantId,
        cartId: cart._id.toString(),
        sessionId: identity.sessionId,
        userId: identity.userId,
        total: cart.totals?.total,
        revenue: cart.totals?.total,
        recoveryStage: cart.recoveryStage,
      });
    }

    this.events.publishSync(DomainEvents.CHECKOUT_COMPLETED, {
      tenantId,
      cartId: cart._id.toString(),
      sessionId: identity.sessionId,
      userId: identity.userId,
      checkoutVersion: (cart.checkoutVersion as 'A' | 'B') || 'A',
      total: cart.totals?.total,
      checkoutStep: cart.checkoutStepReached,
      deviceType: cart.deviceType,
      paymentMethod: cart.paymentMethod,
    });

    this.events.publishSync(DomainEvents.ORDER_CREATED, {
      tenantId,
      orderId: order._id?.toString?.() || String(order._id),
      orderNumber: order.orderNumber,
      total: cart.totals?.total,
      cartId: cart._id.toString(),
      fromRecovery: wasAbandoned,
    });

    return {
      order,
      shipping: cart.selectedShipping,
      estimatedDeliveryAt: cart.estimatedDeliveryAt,
    };
  }
}
