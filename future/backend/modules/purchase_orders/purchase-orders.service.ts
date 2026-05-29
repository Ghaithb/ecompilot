import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDocument } from './schemas/purchase-order.schema';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectModel(PurchaseOrder.name) private poModel: Model<PurchaseOrderDocument>,
  ) {}

  async create(tenantId: string, userId: string, dto: any) {
    const po = new this.poModel({
      tenantId,
      userId,
      financingRequestId: dto.financingRequestId,
      amount: dto.amount,
      status: 'pending',
      details: dto.details,
    });
    return po.save();
  }

  async list(tenantId: string) {
    return this.poModel.find({ tenantId }).sort({ createdAt: -1 });
  }
}
