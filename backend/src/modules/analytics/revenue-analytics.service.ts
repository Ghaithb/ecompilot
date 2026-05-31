import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Shipment, ShipmentDocument } from '../delivery/schemas/shipment.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricDocument,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';

/** Merchant analytics — revenue recovery, funnel, channel performance. */
@Injectable()
export class RevenueAnalyticsService {
  constructor(
    @InjectModel(ConversionDailyMetric.name)
    private metricModel: Model<ConversionDailyMetricDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
  ) {}

  private dateKey(d = new Date()) {
    return d.toISOString().slice(0, 10);
  }

  async getOverview(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateFrom = this.dateKey(thirtyDaysAgo);

    const [metrics, abandonedCarts, convertedFromRecovery, orders, delivered] = await Promise.all([
      this.metricModel.find({ tenantId, dateKey: { $gte: dateFrom } }).lean(),
      this.cartModel
        .find({ tenantId, status: 'abandoned' })
        .select('totals items urgencyLevel conversionScore abandonedAt')
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

    const recoveryRate =
      recoveriesSent > 0 ? Math.round((convertedFromRecovery / recoveriesSent) * 100) : 0;
    const checkoutConversionRate =
      checkoutsStarted > 0 ? Math.round((checkoutsCompleted / checkoutsStarted) * 100) : 0;

    const channelAgg = { email: 0, whatsapp: 0, sms: 0 };
    for (const m of metrics) {
      channelAgg.email += m.channels?.email?.sent || 0;
      channelAgg.whatsapp += m.channels?.whatsapp?.sent || 0;
      channelAgg.sms += m.channels?.sms?.sent || 0;
    }

    const productMap = new Map<string, { title: string; count: number; value: number }>();
    for (const cart of abandonedCarts) {
      for (const item of cart.items || []) {
        const key = item.name;
        const prev = productMap.get(key) || { title: key, count: 0, value: 0 };
        prev.count += item.quantity;
        prev.value += item.subtotal || 0;
        productMap.set(key, prev);
      }
    }

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

    return {
      revenueRecovered: Math.round(revenueRecovered * 100) / 100,
      abandonedCartValue: Math.round(abandonedValue * 100) / 100,
      recoveryRate,
      checkoutConversionRate,
      pendingAbandoned: abandonedCarts.length,
      recoveriesSent,
      recoveredCount: convertedFromRecovery,
      topRecoveredProducts: [...productMap.values()].sort((a, b) => b.value - a.value).slice(0, 5),
      channelPerformance: {
        email: { sent: channelAgg.email },
        whatsapp: { sent: channelAgg.whatsapp },
        sms: { sent: channelAgg.sms },
      },
      funnel: {
        cart: metrics.reduce((s, m) => s + (m.cartsCreated || 0), 0),
        checkout: checkoutsStarted,
        order: orders,
        delivered,
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
      lowConversionCarts: abandonedCarts
        .filter((c) => (c.conversionScore ?? 50) < 40)
        .slice(0, 8)
        .map((c) => ({
          id: (c as { _id: unknown })._id,
          total: c.totals?.total,
          score: c.conversionScore,
          urgencyLevel: c.urgencyLevel,
          abandonedAt: c.abandonedAt,
        })),
    };
  }

  async getSalesMetrics(
    tenantId: string,
    startDate?: string,
    endDate?: string,
    channel?: string,
    category?: string,
  ) {
    const end = endDate ? new Date(`${endDate}T23:59:59`) : new Date();
    const start = startDate
      ? new Date(`${startDate}T00:00:00`)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filter: Record<string, unknown> = {
      tenantId,
      createdAt: { $gte: start, $lte: end },
    };
    if (channel && channel !== 'all') {
      filter.paymentMethod = channel;
    }

    const orders = await this.orderModel.find(filter).lean();
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders = orders.length;

    const periodMap = new Map<string, { revenue: number; orders: number }>();
    const productMap = new Map<
      string,
      { productId: string; title: string; quantitySold: number; revenue: number; category?: string }
    >();
    const categoryMap = new Map<string, number>();

    for (const order of orders) {
      const day = (order.createdAt as Date).toISOString().slice(0, 10);
      const prev = periodMap.get(day) || { revenue: 0, orders: 0 };
      prev.revenue += order.total || 0;
      prev.orders += 1;
      periodMap.set(day, prev);

      for (const item of order.lineItems || []) {
        const title = item.title || item.name || 'Produit';
        const cat = (item as { category?: string }).category || 'Autre';
        if (category && category !== 'all' && cat !== category) continue;

        const key = String(item.productId || title);
        const p = productMap.get(key) || {
          productId: key,
          title,
          quantitySold: 0,
          revenue: 0,
          category: cat,
        };
        p.quantitySold += item.quantity || 1;
        p.revenue += (item.price ?? 0) * (item.quantity || 1);
        productMap.set(key, p);
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + p.revenue);
      }
    }

    const revenueByPeriod = [...periodMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, v]) => ({ period, revenue: Math.round(v.revenue * 1000) / 1000, orders: v.orders }));

    const topSellingProducts = [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const salesByCategory = [...categoryMap.entries()].map(([name, value]) => ({
      name,
      value: Math.round(value * 1000) / 1000,
    }));

    return {
      totalRevenue: Math.round(totalRevenue * 1000) / 1000,
      totalOrders,
      averageOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 1000) / 1000 : 0,
      revenueByPeriod,
      topSellingProducts,
      salesByCategory,
    };
  }

  async getInventoryMetrics(tenantId: string) {
    const products = await this.productModel.find({ tenantId, status: { $ne: 'archived' } }).lean();
    let totalVariants = 0;
    let totalInventoryValue = 0;
    let outOfStockItems = 0;
    let lowStockItems = 0;
    let inStockItems = 0;

    for (const product of products) {
      for (const variant of product.variants || []) {
        totalVariants += 1;
        const qty = variant.inventory ?? 0;
        const price = variant.price ?? 0;
        totalInventoryValue += qty * price;
        if (qty <= 0) outOfStockItems += 1;
        else if (qty <= 5) lowStockItems += 1;
        else inStockItems += 1;
      }
    }

    return {
      totalProducts: products.length,
      totalVariants,
      totalInventoryValue: Math.round(totalInventoryValue * 1000) / 1000,
      outOfStockItems,
      lowStockItems,
      inStockItems,
    };
  }

  async exportCsv(tenantId: string, type: 'sales' | 'inventory' | 'all' = 'all') {
    const lines: string[] = [];
    if (type === 'sales' || type === 'all') {
      const sales = await this.getSalesMetrics(tenantId);
      lines.push('section,metric,value');
      lines.push(`sales,totalRevenue,${sales.totalRevenue}`);
      lines.push(`sales,totalOrders,${sales.totalOrders}`);
      lines.push(`sales,averageOrderValue,${sales.averageOrderValue}`);
    }
    if (type === 'inventory' || type === 'all') {
      const inv = await this.getInventoryMetrics(tenantId);
      lines.push('section,metric,value');
      lines.push(`inventory,totalProducts,${inv.totalProducts}`);
      lines.push(`inventory,outOfStockItems,${inv.outOfStockItems}`);
    }
    return lines.join('\n');
  }

  async getVisitorMetrics(tenantId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const dateFrom = this.dateKey(from);

    const metrics = await this.metricModel.find({ tenantId, dateKey: { $gte: dateFrom } }).lean();

    const totals = metrics.reduce(
      (acc, m) => {
        const sf = m.storefront || {};
        acc.views += sf.views || 0;
        acc.mobileViews += sf.mobileViews || 0;
        acc.desktopViews += sf.desktopViews || 0;
        acc.addToCart += sf.addToCart || 0;
        acc.purchases += sf.purchases || 0;
        acc.checkoutsStarted += m.checkoutsStarted || 0;
        acc.checkoutsCompleted += m.checkoutsCompleted || 0;
        return acc;
      },
      {
        views: 0,
        mobileViews: 0,
        desktopViews: 0,
        addToCart: 0,
        purchases: 0,
        checkoutsStarted: 0,
        checkoutsCompleted: 0,
      },
    );

    const daily = metrics
      .map((m) => {
        const sf = m.storefront || {};
        return {
          date: m.dateKey,
          views: sf.views || 0,
          addToCart: sf.addToCart || 0,
          purchases: sf.purchases || 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      periodDays: days,
      ...totals,
      conversionRate: totals.views > 0 ? Math.round((totals.purchases / totals.views) * 1000) / 10 : 0,
      checkoutRate:
        totals.checkoutsStarted > 0
          ? Math.round((totals.checkoutsCompleted / totals.checkoutsStarted) * 1000) / 10
          : 0,
      daily,
    };
  }
}
