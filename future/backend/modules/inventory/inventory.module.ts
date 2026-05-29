import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryTasksService } from './inventory-tasks.service';
import { TenantsModule } from '../tenants/tenants.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TenantsModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    ProductsModule,
    NotificationsModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryTasksService],
  exports: [InventoryService],
})
export class InventoryModule {}
