import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantScopedRepository } from '../../../core/tenant/tenant-scoped.repository';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class OrdersRepository extends TenantScopedRepository<OrderDocument> {
  constructor(@InjectModel(Order.name) orderModel: Model<OrderDocument>) {
    super(orderModel);
  }

  async findAllForTenant(tenantId: string) {
    return this.model
      .find(this.tenantFilter(tenantId))
      .sort({ createdAt: -1 })
      .exec();
  }

  async findReturnsForTenant(tenantId: string) {
    return this.findAllByTenant(tenantId, {
      status: {
        $in: [
          'refused',
          'returned_to_seller',
          'return_completed',
          'return_rejected',
        ],
      },
    });
  }

  async findByOrderNumber(tenantId: string, orderNumber: string) {
    return this.model
      .findOne({ orderNumber, ...this.tenantFilter(tenantId) })
      .exec();
  }
}
