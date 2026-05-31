import { Injectable } from '@nestjs/common';
import { DeliveryService } from '../delivery/services/delivery.service';
import { CartDocument } from '../cart/schemas/cart.schema';
import { CheckoutAddressDto } from '../cart/dto/checkout.dto';
import { ConversionIntelligenceService } from './conversion-intelligence.service';

interface QuoteCacheEntry {
  expiresAt: number;
  payload: unknown;
}

@Injectable()
export class CheckoutOptimizationService {
  private readonly quoteCache = new Map<string, QuoteCacheEntry>();
  private readonly cacheTtlMs = 5 * 60 * 1000;

  constructor(
    private delivery: DeliveryService,
    private intelligence: ConversionIntelligenceService,
  ) {}

  cacheKey(tenantId: string, cartId: string, governorate?: string) {
    return `${tenantId}:${cartId}:${governorate || 'na'}`;
  }

  getCachedQuote(key: string) {
    const entry = this.quoteCache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.quoteCache.delete(key);
      return null;
    }
    return entry.payload;
  }

  setCachedQuote(key: string, payload: unknown) {
    this.quoteCache.set(key, { expiresAt: Date.now() + this.cacheTtlMs, payload });
  }

  deliveryConfidenceScore(quotesCount: number, hasPhone: boolean): number {
    let score = 40;
    if (quotesCount >= 2) score += 35;
    else if (quotesCount === 1) score += 20;
    if (hasPhone) score += 15;
    return Math.min(100, score);
  }

  detectFriction(cart: CartDocument, address?: CheckoutAddressDto, checkoutStep = 0) {
    const intel = this.intelligence.analyzeCart(cart, {
      checkoutStarted: true,
      checkoutStep,
      paymentMethod: cart.paymentMethod,
      deviceType: cart.deviceType as 'mobile' | 'desktop' | 'unknown',
    });
    const flags = [...intel.frictionFlags];
    if (!address?.phone && !cart.customerPhone) flags.push('missing_phone');
    if (!address?.governorate) flags.push('missing_governorate');

    const shipping = cart.totals?.shipping ?? 0;
    const subtotal = cart.totals?.subtotal || cart.totals?.total || 0;
    const shippingRatio = subtotal > 0 ? shipping / subtotal : 0;
    const deliveryPriceSensitive = shippingRatio > 0.15;

    return {
      frictionFlags: flags,
      deliveryPriceSensitive,
      shippingRatio: Math.round(shippingRatio * 100) / 100,
      conversionScore: intel.conversionScore,
      abandonmentProbability: intel.abandonmentProbability,
      urgencyLevel: intel.urgencyLevel,
    };
  }

  predictCheckoutAbandonment(cart: CartDocument, address?: CheckoutAddressDto) {
    const step = cart.checkoutStepReached || 0;
    const friction = this.detectFriction(cart, address, step);
    const abandonRisk = friction.abandonmentProbability;
    const isHighValue = (cart.totals?.total || 0) >= 150;

    const tooltips: Array<{ flag: string; message: string }> = [];
    if (friction.frictionFlags.includes('high_shipping_ratio')) {
      tooltips.push({
        flag: 'high_shipping_ratio',
        message: 'Frais de livraison basés sur votre zone — paiement à la livraison, sans surprise.',
      });
    }
    if (friction.frictionFlags.includes('missing_phone')) {
      tooltips.push({
        flag: 'missing_phone',
        message: 'Le téléphone permet la confirmation SMS et le suivi livraison.',
      });
    }

    return {
      abandonRisk,
      abandonmentProbability: abandonRisk,
      conversionScore: friction.conversionScore,
      urgencyLevel: friction.urgencyLevel,
      riskLevel: friction.urgencyLevel,
      frictionFlags: friction.frictionFlags,
      deliveryPriceSensitive: friction.deliveryPriceSensitive,
      showExitWarning: abandonRisk >= 0.4 || isHighValue,
      showDeliveryGuarantee: isHighValue || friction.deliveryPriceSensitive,
      frictionTooltips: tooltips,
      codTrust: {
        headline: 'Paiement à la livraison — zéro risque',
        bullets: [
          'Payez uniquement à réception',
          'Confirmation par SMS avant expédition',
          'Retour facile si produit non conforme',
        ],
      },
      message: isHighValue
        ? 'Votre panier sera réservé — paiement COD à la livraison.'
        : 'Finalisez en 30 sec — paiement à la livraison, sans compte.',
    };
  }

  buildQuoteUiHints(cart: CartDocument, quotesCount: number) {
    const friction = this.detectFriction(cart);
    return {
      limitedTimeDeliveryGuarantee: (cart.totals?.total || 0) >= 100,
      deliverySensitivityWarning: friction.deliveryPriceSensitive
        ? 'Les frais reflètent votre gouvernorat — livraison 24-72h garantie.'
        : undefined,
      frictionTooltips: friction.frictionFlags.includes('high_shipping_ratio')
        ? 'Frais calculés selon poids et zone — pas de frais cachés.'
        : undefined,
      deliveryConfidence: this.deliveryConfidenceScore(quotesCount, Boolean(cart.customerPhone)),
    };
  }
}
