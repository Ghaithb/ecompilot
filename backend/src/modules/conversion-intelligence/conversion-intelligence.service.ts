import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CartDocument } from '../cart/schemas/cart.schema';
import { AbandonedCart, AbandonedCartDocument } from './schemas/abandoned-cart.schema';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { Cron, CronExpression } from '@nestjs/schedule';

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
  riskLevel: UrgencyLevel;
  conversionProbability: number;
}

@Injectable()
export class ConversionIntelligenceService {
  private readonly logger = new Logger(ConversionIntelligenceService.name);

  constructor(
    @InjectModel(AbandonedCart.name) private abandonedCartModel: Model<AbandonedCartDocument>,
    private whatsappService: WhatsAppService,
  ) {}

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

  async trackAbandonedCart(tenantId: string, cart: CartDocument, intel: CartIntelligenceV2) {
    if (!cart.customerPhone) return;

    await this.abandonedCartModel.findOneAndUpdate(
      { cartId: cart._id, tenantId: new Types.ObjectId(tenantId) },
      {
        customerPhone: cart.customerPhone,
        customerEmail: cart.customerEmail,
        cartData: cart.toObject(),
        conversionScore: intel.conversionScore,
        frictionFlags: intel.frictionFlags,
        status: 'pending',
      },
      { upsert: true, new: true },
    );
  }

  async getAbandonedCarts(tenantId: string, query: { page: number; limit: number; status?: string }) {
    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      this.abandonedCartModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.abandonedCartModel.countDocuments(filter),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async triggerManualReminder(tenantId: string, id: string) {
    const cart = await this.abandonedCartModel.findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) });
    if (!cart) throw new NotFoundException('Panier non trouvé');

    await this.sendWhatsAppRecovery(cart);

    cart.status = 'reminded';
    cart.lastReminderAt = new Date();
    cart.reminderCount += 1;
    await cart.save();

    return { success: true };
  }

  private async sendWhatsAppRecovery(cart: AbandonedCartDocument) {
    const total = cart.cartData?.totals?.total || 0;
    await this.whatsappService.sendTemplateMessage(cart.tenantId.toString(), {
      to: cart.customerPhone,
      templateName: 'cart_recovery',
      params: {
        customerName: cart.cartData?.customerName || 'Cher client',
        cartTotal: total.toString(),
        checkoutUrl: `${process.env.APP_URL}/checkout?cartId=${cart.cartId}`,
      },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoReminders() {
    this.logger.log('Vérification des relances automatiques pour paniers abandonnés');
    
    // Paniers abandonnés depuis plus d'une heure, avec un score de conversion raisonnable (>30)
    const oneHourAgo = new Date(Date.now() - 60 * 60000);
    const abandoned = await this.abandonedCartModel.find({
      status: 'pending',
      conversionScore: { $gt: 30 },
      createdAt: { $lt: oneHourAgo },
      reminderCount: 0,
    });

    for (const cart of abandoned) {
      try {
        await this.sendWhatsAppRecovery(cart);
        cart.status = 'reminded';
        cart.lastReminderAt = new Date();
        cart.reminderCount = 1;
        await cart.save();
      } catch (e) {
        this.logger.error(`Erreur relance auto pour ${cart._id}: ${e.message}`);
      }
    }
  }

  async getConversionStats(tenantId: string) {
    const tid = new Types.ObjectId(tenantId);
    const [total, recovered, byScore] = await Promise.all([
      this.abandonedCartModel.countDocuments({ tenantId: tid }),
      this.abandonedCartModel.countDocuments({ tenantId: tid, status: 'recovered' }),
      this.abandonedCartModel.aggregate([
        { $match: { tenantId: tid } },
        { $group: { _id: '$urgencyLevel', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalAbandoned: total,
      recoveredCount: recovered,
      recoveryRate: total > 0 ? (recovered / total) * 100 : 0,
      byRisk: byScore,
    };
  }
}
