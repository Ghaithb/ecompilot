import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

/**
 * Repository de base — impose tenantId sur toutes les lectures/écritures.
 */
export abstract class TenantScopedRepository<T extends { tenantId?: Types.ObjectId | string }> {
  constructor(protected readonly model: Model<T>) {}

  protected tenantFilter(tenantId: string): FilterQuery<T> {
    return { tenantId: new Types.ObjectId(tenantId) } as FilterQuery<T>;
  }

  async findAllByTenant(tenantId: string, extra: FilterQuery<T> = {}) {
    return this.model.find({ ...this.tenantFilter(tenantId), ...extra }).exec();
  }

  async findOneByTenant(tenantId: string, id: string) {
    return this.model
      .findOne({ _id: id, ...this.tenantFilter(tenantId) } as FilterQuery<T>)
      .exec();
  }

  async createForTenant(tenantId: string, data: Partial<T>) {
    return this.model.create({
      ...data,
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async updateOneByTenant(tenantId: string, id: string, update: UpdateQuery<T>) {
    return this.model
      .findOneAndUpdate(
        { _id: id, ...this.tenantFilter(tenantId) } as FilterQuery<T>,
        update,
        { new: true },
      )
      .exec();
  }

  async deleteOneByTenant(tenantId: string, id: string) {
    return this.model
      .findOneAndDelete({ _id: id, ...this.tenantFilter(tenantId) } as FilterQuery<T>)
      .exec();
  }

  async countByTenant(tenantId: string, extra: FilterQuery<T> = {}) {
    return this.model.countDocuments({ ...this.tenantFilter(tenantId), ...extra });
  }
}
