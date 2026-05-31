import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverController } from './driver.controller';
import { MerchantDriversController } from './merchant-drivers.controller';
import { DriverService } from './driver.service';
import { DriverManagementService } from './driver-management.service';
import { DriverReconciliationService } from './driver-reconciliation.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { OrderStatusService } from '../orders/order-status.service';
import { ReturnsService } from '../orders/returns.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WhatsAppModule,
  ],
  controllers: [DriverController, MerchantDriversController],
  providers: [
    DriverService,
    DriverManagementService,
    DriverReconciliationService,
    OrderStatusService,
    ReturnsService,
  ],
  exports: [DriverService, DriverManagementService, DriverReconciliationService],
})
export class DriverModule {}
