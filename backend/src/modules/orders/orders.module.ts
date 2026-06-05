import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersApiController } from './api/orders.api.controller';
import { OrdersRepository } from './infrastructure/orders.repository';
import { OrdersQueryService } from './application/orders-query.service';
import { PublicOrdersController } from './public-orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatusService } from './order-status.service';
import { ReturnsService } from './returns.service';
import { TreasuryService } from './treasury.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { TenantsModule } from '../tenants/tenants.module';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CodTrustModule } from '../cod-trust/cod-trust.module';
import { CoreModule } from '../../core/core.module';
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
    CoreModule,
    NotificationsModule,
    CodTrustModule,
    WhatsAppModule,
  ],
  controllers: [OrdersController, OrdersApiController, PublicOrdersController],
  providers: [OrdersService, OrderStatusService, ReturnsService, TreasuryService, OrdersRepository, OrdersQueryService],
  exports: [MongooseModule, OrdersService, OrderStatusService, ReturnsService, TreasuryService],
})
export class OrdersModule {}
