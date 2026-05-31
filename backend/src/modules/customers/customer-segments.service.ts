import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CustomerSegment, CustomerSegmentDocument } from './schemas/customer-segment.schema';

@Injectable()
export class CustomerSegmentsService {
  constructor(
    @InjectModel(CustomerSegment.name) private segmentModel: Model<CustomerSegmentDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  list(tenantId: string) {
    return this.segmentModel.find({ tenantId: new Types.ObjectId(tenantId) }).sort({ name: 1 }).lean();
  }

  async create(
    tenantId: string,
    payload: { name: string; description?: string; tags?: string[]; minOrders?: number; codLevel?: string },
  ) {
    return this.segmentModel.create({
      tenantId: new Types.ObjectId(tenantId),
      ...payload,
    });
  }

  async countMatches(tenantId: string, segmentId: string) {
    const segment = await this.segmentModel.findOne({
      _id: segmentId,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!segment) throw new NotFoundException('Segment introuvable');

    const filter: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };
    if (segment.tags?.length) filter.tags = { $in: segment.tags };
    if (segment.minOrders) filter['stats.totalOrders'] = { $gte: segment.minOrders };
    if (segment.codLevel) filter['codTrust.level'] = segment.codLevel;

    const count = await this.customerModel.countDocuments(filter);
    return { segmentId, count, filter };
  }
}
