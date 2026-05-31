import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Shipment, ShipmentDocument } from '../delivery/schemas/shipment.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricDocument,
} from './schemas/conversion-daily-metric.schema';

@Injectable()
export class ConversionMetricsService {
  constructor(
    @InjectModel(ConversionDailyMetric.name)
    private metricModel: Model<ConversionDailyMetricDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
  ) {}

  private dateKey(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  async increment(tenantId: string, field: string, amount = 1) {
    const dateKey = this.dateKey();
    await this.metricModel.updateOne(
      { tenantId, dateKey },
      { $inc: { [field]: amount }, $setOnInsert: { tenantId, dateKey } },
      { upsert: true },
    );
  }

  async getDashboard(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateFrom = this.dateKey(thirtyDaysAgo);

    const [metrics, abandonedCarts, convertedFromRecovery, orders, shipments] = await Promise.all([
      this.metricModel.find({ tenantId, dateKey: { $gte: dateFrom } }).lean(),
      this.cartModel
        .find({ tenantId, status: 'abandoned' })
        .select('totals items riskLevel urgencyLevel conversionScore abandonedAt')
        .lean(),
      this.cartModel.countDocuments({ tenantId, recoveredFromAbandonment: true }),
      this.orderModel.countDocuments({ tenantId, createdAt: { $gte: thirtyDaysAgo } }),
      this.shipmentModel.countDocuments({
        tenantId,
        status: 'delivered',
        updatedAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    const abandonedValue = abandonedCarts.reduce((s, c) => s + (c.totals?.total || 0), 0);
    const revenueRecovered = metrics.reduce((s, m) => s + (m.revenueRecovered || 0), 0);
    const recoveriesSent = metrics.reduce((s, m) => s + (m.recoveriesSent || 0), 0);
    const checkoutsStarted = metrics.reduce((s, m) => s + (m.checkoutsStarted || 0), 0);
    const checkoutsCompleted = metrics.reduce((s, m) => s + (m.checkoutsCompleted || 0), 0);
    const cartsAbandoned = metrics.reduce((s, m) => s + (m.cartsAbandoned || 0), 0);

    const recoveryRate =
      recoveriesSent > 0 ? Math.round((convertedFromRecovery / recoveriesSent) * 100) : 0;
    const checkoutConversionRate =
      checkoutsStarted > 0 ? Math.round((checkoutsCompleted / checkoutsStarted) * 100) : 0;

    const productRecoveryMap = new Map<string, { title: string; count: number; value: number }>();
    for (const cart of abandonedCarts) {
      for (const item of cart.items || []) {
        const key = item.name;
        const prev = productRecoveryMap.get(key) || { title: key, count: 0, value: 0 };
        prev.count += item.quantity;
        prev.value += item.subtotal || 0;
        productRecoveryMap.set(key, prev);
      }
    }
    const topRecoveringProducts = [...productRecoveryMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const checkoutA = metrics.reduce(
      (acc, m) => ({
        started: acc.started + (m.experiments?.checkoutA?.started || 0),
        completed: acc.completed + (m.experiments?.checkoutA?.completed || 0),
      }),
      { started: 0, completed: 0 },
    );
    const checkoutB = metrics.reduce(
      (acc, m) => ({
        started: acc.started + (m.experiments?.checkoutB?.started || 0),
        completed: acc.completed + (m.experiments?.checkoutB?.completed || 0),
      }),
      { started: 0, completed: 0 },
    );

    const channelPerformance = {
      email: { sent: metrics.reduce((s, m) => s + (m.channels?.email?.sent || 0), 0) },
      whatsapp: { sent: metrics.reduce((s, m) => s + (m.channels?.whatsapp?.sent || 0), 0) },
      sms: { sent: metrics.reduce((s, m) => s + (m.channels?.sms?.sent || 0), 0) },
    };

    return {
      revenueRecovered: Math.round(revenueRecovered * 100) / 100,
      abandonedCartsValue: Math.round(abandonedValue * 100) / 100,
      recoveryRate,
      checkoutConversionRate,
      pendingAbandoned: abandonedCarts.length,
      recoveriesSent,
      recoveredCount: convertedFromRecovery,
      topRecoveringProducts,
      funnel: {
        carts: metrics.reduce((s, m) => s + (m.cartsCreated || 0), 0),
        checkouts: checkoutsStarted,
        orders: orders,
        delivered: shipments,
      },
      recoveryFunnel: {
        abandoned: cartsAbandoned,
        remindersSent: recoveriesSent,
        recovered: convertedFromRecovery,
      },
      experiments: {
        checkoutA: {
          ...checkoutA,
          conversionRate: checkoutA.started
            ? Math.round((checkoutA.completed / checkoutA.started) * 100)
            : 0,
        },
        checkoutB: {
          ...checkoutB,
          conversionRate: checkoutB.started
            ? Math.round((checkoutB.completed / checkoutB.started) * 100)
            : 0,
        },
      },
      channelPerformance,
      recentHighRisk: abandonedCarts
        .filter((c) => (c.conversionScore ?? 50) < 40 || c.urgencyLevel === 'high' || c.riskLevel === 'high')
        .slice(0, 8)
        .map((c) => ({
          id: (c as { _id: unknown })._id,
          total: c.totals?.total,
          score: c.conversionScore,
          riskLevel: c.riskLevel,
          abandonedAt: c.abandonedAt,
        })),
    };
  }
}
