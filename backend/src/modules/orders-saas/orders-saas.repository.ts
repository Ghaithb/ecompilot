import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import type { CreateOrderInput, ListOrdersQuery } from './schemas/order.zod';

@Injectable()
export class OrdersSaasRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  private toObjectId(id: string) {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
  }

  async create(
    tenantId: string,
    orderNumber: string,
    input: CreateOrderInput,
    totals: { subtotal: number; total: number },
  ) {
    const orderData = {
      tenantId: this.toObjectId(tenantId),
      orderNumber,
      customerEmail: input.customerEmail,
      status: 'created',
      paymentMethod: input.paymentMethod,
      currency: input.currency,
      subtotal: totals.subtotal,
      taxAmount: input.taxAmount,
      shippingAmount: input.shippingAmount,
      discountAmount: input.discountAmount,
      total: totals.total,
      shippingAddress: input.shippingAddress,
      metadata: input.metadata ?? {},
      lineItems: input.lineItems.map((item) => ({
        productId: this.toObjectId(item.productId),
        title: item.title,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.quantity * item.unitPrice,
        variantId: 'default', // Default value placeholder
      })),
      statusHistory: [
        {
          status: 'created',
          changedAt: new Date(),
          note: 'Commande créée',
        },
      ],
    };

    return this.orderModel.create(orderData);
  }

  async findMany(tenantId: string, query: ListOrdersQuery) {
    const filter: any = { tenantId: this.toObjectId(tenantId) };
    
    if (query.status) {
      filter.status = query.status;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { customerEmail: { $regex: q, $options: 'i' } },
        { trackingNumber: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit) || 1,
    };
  }

  async findById(tenantId: string, orderId: string) {
    return this.orderModel
      .findOne({ _id: orderId, tenantId: this.toObjectId(tenantId) })
      .lean()
      .exec();
  }

  async updateStatus(
    tenantId: string,
    orderId: string,
    data: {
      status: string;
      changedBy?: string;
      note?: string;
      fromStatus: string;
    },
  ) {
    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, tenantId: this.toObjectId(tenantId) },
      {
        $set: { status: data.status, updatedAt: new Date() },
        $push: {
          statusHistory: {
            status: data.status,
            changedAt: new Date(),
            changedBy: data.changedBy,
            note: data.note,
          },
        },
      },
      { new: true },
    );

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    return order;
  }

  async linkShipment(
    tenantId: string,
    orderId: string,
    data: {
      shipmentId: string;
      trackingNumber?: string;
      shippingProvider?: string;
      status?: string;
      fromStatus?: string;
    },
  ) {
    const update: any = {
      $set: {
        shipmentId: data.shipmentId,
        trackingNumber: data.trackingNumber,
        shippingProvider: data.shippingProvider,
        updatedAt: new Date(),
      },
    };

    if (data.status) {
      update.$set.status = data.status;
      update.$push = {
        statusHistory: {
          status: data.status,
          changedAt: new Date(),
          note: `Lié à l'expédition ${data.shipmentId}`,
        },
      };
    }

    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, tenantId: this.toObjectId(tenantId) },
      update,
      { new: true },
    );

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    return order;
  }
}
