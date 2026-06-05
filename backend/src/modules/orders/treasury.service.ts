import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Injectable()
export class TreasuryService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getCarrierBalances(tenantId: string) {
    const orders = await this.orderModel.find({
      tenantId,
      paymentMethod: 'cod',
      status: { $in: [OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.COMPLETED] }
    }).lean();

    const balances: Record<string, number> = {};
    
    orders.forEach(order => {
      const carrier = order.shippingProvider || 'Unknown';
      // Si la commande est DELIVERED mais pas encore PAID par le transporteur au marchand
      if (order.status === OrderStatus.DELIVERED) {
        balances[carrier] = (balances[carrier] || 0) + (order.total || 0);
      }
    });

    return {
      totalToReceive: Object.values(balances).reduce((a, b) => a + b, 0),
      byCarrier: Object.entries(balances).map(([name, amount]) => ({
        name,
        amount,
        estimatedPayment: this.estimatePaymentDate(name),
      }))
    };
  }

  private estimatePaymentDate(carrier: string): string {
    const today = new Date();
    // Simulation simple de calendrier de paiement local
    if (carrier.toLowerCase().includes('intigo')) return 'Lundi / Jeudi';
    if (carrier.toLowerCase().includes('aramex')) return 'Mardi / Vendredi';
    return 'Hebdomadaire';
  }

  async getRefusalAnalytics(tenantId: string) {
    const refusedOrders = await this.orderModel.find({
      tenantId,
      status: OrderStatus.REFUSED
    }).lean();

    const stats = {
      byGovernorate: {} as Record<string, number>,
      byProduct: {} as Record<string, number>,
    };

    refusedOrders.forEach(order => {
      const gov = order.shippingAddress?.province || 'Inconnu';
      stats.byGovernorate[gov] = (stats.byGovernorate[gov] || 0) + 1;
      
      (order.lineItems || []).forEach(item => {
        stats.byProduct[item.title] = (stats.byProduct[item.title] || 0) + 1;
      });
    });

    return stats;
  }
}
