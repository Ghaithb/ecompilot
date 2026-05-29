import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantModel.findById(id).exec();
  }

  // Ajoutez d'autres méthodes si besoin (create, update, delete, etc.)
}
