import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Shipment, ShipmentDocument } from '../delivery/schemas/shipment.schema';

@Injectable()
export class DeliveryIntelligenceService {
  private readonly logger = new Logger(DeliveryIntelligenceService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
  ) {}

  /**
   * Calcule le taux de livraison par transporteur pour un titre de produit donné.
   */
  async getCarrierPerformanceForProduct(productTitle: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return this.shipmentModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      { $unwind: '$order.lineItems' },
      {
        $match: {
          'order.lineItems.title': { $regex: productTitle, $options: 'i' },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$provider',
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          returned: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          provider: '$_id',
          deliveryRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] },
              0,
            ],
          },
          total: 1,
        },
      },
      { $sort: { deliveryRate: -1 } },
    ]);
  }

  /**
   * Identifie les régions (provinces) avec le meilleur et le moins bon taux de livraison.
   */
  async getRegionalIntelligence() {
    // Agrégation par province
    return this.orderModel.aggregate([
      {
        $group: {
          _id: '$shippingAddress.province',
          total: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }, // OTP Success
        },
      },
      { $sort: { total: -1 } },
    ]);
  }
}
