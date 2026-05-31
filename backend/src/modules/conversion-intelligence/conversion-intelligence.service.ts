import { Injectable } from '@nestjs/common';
import { CartDocument } from '../cart/schemas/cart.schema';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface AnalyzeContext {
  checkoutStarted?: boolean;
  checkoutStep?: number;
  deviceType?: 'mobile' | 'desktop' | 'unknown';
  paymentMethod?: string;
  shippingCost?: number;
}

export interface CartIntelligenceV2 {
  conversionScore: number;
  abandonmentProbability: number;
  urgencyLevel: UrgencyLevel;
  frictionFlags: string[];
  isHighValue: boolean;
  signals: Record<string, unknown>;
  /** @deprecated alias */
  riskLevel: UrgencyLevel;
  conversionProbability: number;
}

/**
 * Rule-based scoring V2 — O(1), deterministic.
 * conversionScore = likelihood to convert (higher is better).
 */
@Injectable()
export class ConversionIntelligenceService {
  analyzeCart(cart: CartDocument, context: AnalyzeContext = {}): CartIntelligenceV2 {
    const total = cart.totals?.total || 0;
    const subtotal = cart.totals?.subtotal || total;
    const shipping = cart.totals?.shipping ?? cart.selectedShipping?.rate ?? 0;
    const itemCount = cart.items?.length || 0;
    const deviceType = context.deviceType || cart.deviceType || 'unknown';
    const paymentMethod = context.paymentMethod || cart.paymentMethod || 'cod';
    const checkoutStep = context.checkoutStep ?? cart.checkoutStepReached ?? 0;
    const inactiveMinutes = cart.lastActivityAt
      ? (Date.now() - new Date(cart.lastActivityAt).getTime()) / 60000
      : 0;

    const frictionFlags: string[] = [];
    if (!cart.customerPhone) frictionFlags.push('missing_phone');
    if (!cart.shippingAddress?.address && (context.checkoutStarted || checkoutStep > 0)) {
      frictionFlags.push('missing_address');
    }
    if (itemCount >= 5) frictionFlags.push('large_cart');

    const shippingRatio = subtotal > 0 ? shipping / subtotal : 0;
    if (shippingRatio > 0.15) frictionFlags.push('high_shipping_ratio');

    let score = 55;
    if (cart.customerPhone) score += 12;
    if (cart.customerEmail && !cart.customerEmail.includes('@guest.')) score += 5;
    if (context.checkoutStarted || cart.checkoutStartedAt) score += 18;
    if (checkoutStep >= 2) score += 10;
    if (checkoutStep >= 3) score += 8;
    if (paymentMethod === 'cod' || cart.codPreferred) score += 8;
    if (deviceType === 'mobile') score += 4;
    if (deviceType === 'desktop') score += 6;
    if (shippingRatio <= 0.08) score += 8;
    else if (shippingRatio > 0.2) score -= 12;
    if (total >= 80 && total <= 400) score += 5;
    if (itemCount >= 2) score += 4;
    if (inactiveMinutes > 30) score -= 15;
    if (inactiveMinutes > 60) score -= 10;
    score -= frictionFlags.length * 3;
    score = Math.max(0, Math.min(100, Math.round(score)));

    const abandonmentProbability = Math.round((1 - score / 100) * 100) / 100;
    const isHighValue = total >= 150;

    let urgencyLevel: UrgencyLevel = 'low';
    if (score < 30 || (isHighValue && score < 45)) urgencyLevel = 'high';
    else if (score < 55) urgencyLevel = 'medium';

    const signals = {
      total,
      shipping,
      shippingRatio: Math.round(shippingRatio * 100) / 100,
      itemCount,
      deviceType,
      paymentMethod,
      checkoutStep,
      inactiveMinutes: Math.round(inactiveMinutes),
    };

    return {
      conversionScore: score,
      abandonmentProbability,
      urgencyLevel,
      frictionFlags,
      isHighValue,
      signals,
      riskLevel: urgencyLevel,
      conversionProbability: score / 100,
    };
  }

  appendScoreHistory(cart: CartDocument, intel: CartIntelligenceV2) {
    if (!cart.scoreHistory) cart.scoreHistory = [];
    cart.scoreHistory.push({
      score: intel.conversionScore,
      abandonmentProbability: intel.abandonmentProbability,
      urgencyLevel: intel.urgencyLevel,
      signals: intel.signals,
      recordedAt: new Date(),
    });
    if (cart.scoreHistory.length > 20) {
      cart.scoreHistory = cart.scoreHistory.slice(-20);
    }
    cart.conversionScore = intel.conversionScore;
    cart.abandonmentProbability = intel.abandonmentProbability;
    cart.urgencyLevel = intel.urgencyLevel;
    cart.riskLevel = intel.urgencyLevel;
    cart.conversionProbability = intel.conversionProbability;
    cart.frictionFlags = intel.frictionFlags;
    cart.deliveryCostSensitivity = Math.round(intel.signals.shippingRatio as number * 100);
  }

  /** Recovery delay by conversion score tier + step (max 3). */
  getRecoveryDelayMinutes(conversionScore: number, stage: number): number | null {
    if (conversionScore > 80) return null;
    if (conversionScore >= 50) return stage === 0 ? 45 : stage === 1 ? 240 : 720;
    if (conversionScore >= 30) return stage === 0 ? 20 : stage === 1 ? 120 : 360;
    return stage === 0 ? 5 : stage === 1 ? 60 : 180;
  }
}
