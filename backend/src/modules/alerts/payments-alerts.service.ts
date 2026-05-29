import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

export interface PaymentAlert {
  type: 'failed_payment' | 'high_pending_volume' | 'refund_spike';
  message: string;
  count?: number;
  period?: string;
}

@Injectable()
export class PaymentsAlertsService {
  private readonly logger = new Logger(PaymentsAlertsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getPaymentAlerts(tenantId: string): Promise<PaymentAlert[]> {
    const alerts: PaymentAlert[] = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const baseFilter = { tenantId: new Types.ObjectId(tenantId) } as any;

    // Failed payments last 24h
    const failed24h = await this.orderModel.countDocuments({
      ...baseFilter,
      paymentStatus: 'failed',
      createdAt: { $gte: oneDayAgo },
    });
    if (failed24h > 0) {
      alerts.push({
        type: 'failed_payment',
        message: `${failed24h} paiements ont échoué dans les dernières 24h`,
        count: failed24h,
        period: '24h',
      });
    }

    // High pending volume last 24h
    const pending24h = await this.orderModel.countDocuments({
      ...baseFilter,
      paymentStatus: 'pending',
      createdAt: { $gte: oneDayAgo },
    });
    if (pending24h >= 10) {
      alerts.push({
        type: 'high_pending_volume',
        message: `Volume élevé de paiements en attente (${pending24h}) sur 24h`,
        count: pending24h,
        period: '24h',
      });
    }

    // Refund spike last 7d
    const refunded7d = await this.orderModel.countDocuments({
      ...baseFilter,
      paymentStatus: 'refunded',
      updatedAt: { $gte: sevenDaysAgo },
    });
    if (refunded7d >= 5) {
      alerts.push({
        type: 'refund_spike',
        message: `Augmentation des remboursements (${refunded7d}) sur 7 jours`,
        count: refunded7d,
        period: '7d',
      });
    }

    return alerts;
  }
}
