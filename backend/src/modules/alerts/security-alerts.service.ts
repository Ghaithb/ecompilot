import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

export interface SecurityAlert {
  type: 'multiple_failed_by_email' | 'high_value_spike' | 'country_mismatch';
  message: string;
  details?: any;
  period?: string;
}

@Injectable()
export class SecurityAlertsService {
  private readonly logger = new Logger(SecurityAlertsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getSecurityAlerts(tenantId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const baseFilter = { tenantId: new Types.ObjectId(tenantId) } as any;

    // Multiple failed payments by same email in last 24h
    const failed = await this.orderModel.aggregate([
      { $match: { ...baseFilter, paymentStatus: 'failed', createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: '$customerEmail', count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } },
      { $sort: { count: -1 } },
    ]).exec();
    if (failed.length > 0) {
      alerts.push({
        type: 'multiple_failed_by_email',
        message: `${failed.length} emails avec ≥3 paiements échoués sur 24h`,
        details: failed,
        period: '24h',
      });
    }

    // High value spike: orders > P95 amount over last 7 days
    const orders7d = await this.orderModel.find({ ...baseFilter, createdAt: { $gte: sevenDaysAgo } }).select('total orderNumber createdAt').lean();
    if (orders7d.length >= 10) {
      const totals = orders7d.map(o => o.total).sort((a, b) => a - b);
      const p95 = totals[Math.floor(totals.length * 0.95)];
      const spike = orders7d.filter(o => o.total >= p95 && o.total > 0);
      if (spike.length >= 3) {
        alerts.push({
          type: 'high_value_spike',
          message: `Pic de commandes de forte valeur (≥P95=${p95.toFixed(2)}) sur 7 jours: ${spike.length}`,
          details: spike.slice(0, 10).map(s => ({ orderNumber: s.orderNumber, total: s.total, createdAt: s.createdAt })),
          period: '7d',
        });
      }
    }

    // Country mismatch: billing vs shipping country different in last 7 days
    const mismatchCount = await this.orderModel.countDocuments({
      ...baseFilter,
      createdAt: { $gte: sevenDaysAgo },
      'billingAddress.country': { $exists: true, $ne: '' },
      'shippingAddress.country': { $exists: true, $ne: '' },
      $expr: { $ne: ['$billingAddress.country', '$shippingAddress.country'] },
    } as any);
    if (mismatchCount >= 5) {
      alerts.push({
        type: 'country_mismatch',
        message: `Plusieurs commandes avec pays facturation/livraison différents (${mismatchCount}) sur 7 jours`,
        period: '7d',
      });
    }

    return alerts;
  }
}
