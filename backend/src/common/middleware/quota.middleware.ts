import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from '../../modules/tenants/schemas/tenant.schema';

@Injectable()
export class QuotaMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || req.body.tenantId;
    if (!tenantId) return next();
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) return next();
    // Example: check product quota
    if (tenant.limits && tenant.limits.maxProducts) {
      const productCount = await this.tenantModel.db.collection('products').countDocuments({ tenantId });
      if (productCount >= tenant.limits.maxProducts) {
        throw new ForbiddenException('Quota de produits atteint pour votre plan.');
      }
    }
    next();
  }
}
