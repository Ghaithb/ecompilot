import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../../modules/tenants/schemas/tenant.schema';
import { TenantContextService } from './tenant-context.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  providers: [TenantContextService],
  exports: [TenantContextService, MongooseModule],
})
export class TenantCoreModule {}
