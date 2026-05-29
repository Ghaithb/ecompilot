import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

export interface FinanceAlert {
  type: 'negative_margin_orders' | 'low_average_margin';
  message: string;
  count?: number;
  averageMarginRate?: number;
  period?: string;
}

@Injectable()
export class FinanceAlertsService {
  private readonly logger = new Logger(FinanceAlertsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getFinanceAlerts(tenantId: string): Promise<FinanceAlert[]> {
    const alerts: FinanceAlert[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const orders = await this.orderModel.find({
      tenantId: new Types.ObjectId(tenantId),
      createdAt: { $gte: sevenDaysAgo },
      status: { $ne: 'cancelled' },
    }).lean();

    if (orders.length === 0) return alerts;

    // Build cost map for product variants
    const productIds = Array.from(new Set(orders.flatMap(o => o.lineItems.map(li => li.productId?.toString())).filter(Boolean)));
    const products = await this.productModel.find({ _id: { $in: productIds }, tenantId: new Types.ObjectId(tenantId) }).lean();
    const costMap = new Map<string, number>();
    for (const p of products) {
      for (const v of p.variants) {
        costMap.set(`${(p._id as any).toString()}::${v.name}::${v.sku}`, v.cost || 0);
      }
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let negativeMarginOrders = 0;

    for (const order of orders) {
      let orderCost = 0;
      for (const li of order.lineItems) {
        const keyByNameSku = `${li.productId?.toString()}::${li.title}::${li.variantId || ''}`;
        const unitCost = costMap.get(keyByNameSku) ?? 0;
        orderCost += unitCost * li.quantity;
      }
      const revenue = order.total;
      totalRevenue += revenue;
      totalCost += orderCost;
      if (revenue - orderCost < 0) negativeMarginOrders += 1;
    }

    const averageMarginRate = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    if (negativeMarginOrders > 0) {
      alerts.push({
        type: 'negative_margin_orders',
        message: `${negativeMarginOrders} commandes à marge négative sur 7 jours`,
        count: negativeMarginOrders,
        period: '7d',
      });
    }

    if (averageMarginRate > 0 && averageMarginRate < 20) {
      alerts.push({
        type: 'low_average_margin',
        message: `Marge moyenne basse sur 7 jours (${averageMarginRate.toFixed(1)}%)`,
        averageMarginRate,
        period: '7d',
      });
    }

    return alerts;
  }
}
