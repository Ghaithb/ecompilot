import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';
import { Product, ProductSchema } from '../../products/schemas/product.schema';
import { Order, OrderSchema } from '../../orders/schemas/order.schema';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';
import { TenantsModule } from '../../tenants/tenants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    TenantsModule,
  ],
  controllers: [ShopifyController],
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ShopifyIntegrationModule {}
