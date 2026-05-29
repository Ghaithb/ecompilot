import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatusService } from './order-status.service';
import { ReturnsService } from './returns.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { TenantsModule } from '../tenants/tenants.module';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CodTrustModule } from '../cod-trust/cod-trust.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TenantsModule,
    ProductsModule,
    InventoryModule,
    NotificationsModule,
    CodTrustModule,
    RealtimeModule,
    WhatsAppModule,
  ],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService, OrderStatusService, ReturnsService],
  exports: [MongooseModule, OrdersService, OrderStatusService, ReturnsService],
})
export class OrdersModule {}
