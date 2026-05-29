import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { TenantsService } from './tenants.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  providers: [TenantsService],
  // Export the same forFeature so the TenantModel provider is available to other modules
  exports: [MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]), TenantsService],
})
export class TenantsModule {}