import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AbandonedCart, AbandonedCartDocument } from './schemas/abandoned-cart.schema';
import { MultiChannelOrchestratorService } from '../marketing/multi-channel-orchestrator.service';
import { normalizeTunisianPhone } from '../../common/utils/phone.util';
import { RealtimeService } from '../realtime/realtime.service';

export interface RecordAbandonedCartDto {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  sessionId?: string;
  storeSlug?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
}

@Injectable()
export class AbandonedCartService {
  private readonly logger = new Logger(AbandonedCartService.name);

  constructor(
    @InjectModel(AbandonedCart.name) private cartModel: Model<AbandonedCartDocument>,
    @Inject(forwardRef(() => MultiChannelOrchestratorService))
    private readonly orchestrator: MultiChannelOrchestratorService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async getAbandonedCarts(tenantId: string) {
    const carts = await this.cartModel
      .find({ tenantId: new Types.ObjectId(tenantId), recovered: false })
      .sort({ createdAt: -1 })
      .lean();

    return { carts, count: carts.length };
  }

  async getStats(tenantId: string) {
    const filter = { tenantId: new Types.ObjectId(tenantId) };
    const total = await this.cartModel.countDocuments(filter);
    const recovered = await this.cartModel.countDocuments({ ...filter, recovered: true });

    const allCarts = await this.cartModel.find(filter).lean();
    const totalRevenueLost = allCarts
      .filter((c) => !c.recovered)
      .reduce((sum, cart) => sum + cart.totalAmount, 0);
    const totalRevenueRecovered = allCarts
      .filter((c) => c.recovered)
      .reduce((sum, cart) => sum + cart.totalAmount, 0);

    const pendingRelance = allCarts.filter((c) => !c.recovered && (c.remindersSent ?? 0) === 0).length;

    return {
      total,
      recovered,
      pending: total - recovered,
      pendingRelance,
      recoveryRate: total > 0 ? ((recovered / total) * 100).toFixed(2) : 0,
      revenueLost: totalRevenueLost,
      revenueRecovered: totalRevenueRecovered,
    };
  }

  async getConversionCenter(tenantId: string) {
    const stats = await this.getStats(tenantId);
    const carts = await this.cartModel
      .find({ tenantId: new Types.ObjectId(tenantId), recovered: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const actionable = carts.filter((c) => {
      const hours = (Date.now() - new Date((c as any).createdAt).getTime()) / (1000 * 60 * 60);
      return hours >= 0.25 && (c.remindersSent ?? 0) < 3;
    });

    return {
      ...stats,
      cartsToRelance: actionable.length,
      recoverableRevenue: actionable.reduce((s, c) => s + c.totalAmount, 0),
      recentAbandoned: carts,
      recommendations: this.buildRecommendations(stats, actionable.length),
    };
  }

  async recordAbandonedCart(tenantId: string, data: RecordAbandonedCartDto): Promise<AbandonedCartDocument> {
    const phone = data.customerPhone ? normalizeTunisianPhone(data.customerPhone) : undefined;
    const email = data.customerEmail || (phone ? `${phone.replace('+', '')}@guest.ecompilot.local` : undefined);

    const filter: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      recovered: false,
    };

    if (data.sessionId) {
      filter.sessionId = data.sessionId;
    } else if (phone) {
      filter.customerPhone = phone;
    } else if (email) {
      filter.customerEmail = email;
    }

    const existing = await this.cartModel.findOne(filter);
    if (existing) {
      existing.items = data.items;
      existing.totalAmount = data.totalAmount;
      existing.customerName = data.customerName ?? existing.customerName;
      existing.customerPhone = phone ?? existing.customerPhone;
      existing.customerEmail = email ?? existing.customerEmail;
      existing.storeSlug = data.storeSlug ?? existing.storeSlug;
      await existing.save();
      return existing;
    }

    const cart = await this.cartModel.create({
      tenantId: new Types.ObjectId(tenantId),
      customerEmail: email,
      customerName: data.customerName,
      customerPhone: phone,
      sessionId: data.sessionId,
      storeSlug: data.storeSlug,
      items: data.items,
      totalAmount: data.totalAmount,
      recovered: false,
      remindersSent: 0,
      reminderDates: [],
      reminderStage: 0,
      nextReminderAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    this.logger.log(`Panier abandonné enregistré: ${cart._id}`);

    this.realtimeService.abandonedCart(tenantId, {
      id: cart._id.toString(),
      totalAmount: cart.totalAmount,
      customerPhone: cart.customerPhone,
      customerName: cart.customerName,
    });

    return cart;
  }

  async sendReminder(tenantId: string, id: string) {
    const cart = await this.cartModel.findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) });
    if (!cart) throw new Error('Cart not found');

    await this.orchestrator.startRecoverySequence(tenantId, id);
    return { message: 'Recovery sequence started', cartId: id };
  }

  private buildRecommendations(stats: any, toRelance: number): string[] {
    const tips: string[] = [];
    if (toRelance > 0) {
      tips.push(`${toRelance} panier(s) à relancer — lancez WhatsApp + coupon`);
    }
    if (Number(stats.recoveryRate) < 10 && stats.pending > 3) {
      tips.push('Taux de récupération faible — vérifiez vos relances auto');
    }
    if (stats.revenueLost > 0) {
      tips.push(`${stats.revenueLost.toFixed(0)} DT récupérables via relances`);
    }
    if (tips.length === 0) {
      tips.push('Continuez à promouvoir le checkout rapide COD');
    }
    return tips;
  }
}
