import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { AramexProvider } from './providers/aramex.provider';
import { FirstDeliveryProvider } from './providers/first-delivery.provider';
import { IntigoProvider } from './providers/intigo.provider';
import { ShippingFactoryService } from './services/shipping-factory.service';
import { ShippingService } from './services/shipping.service';
import { ShippingController } from './shipping.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  providers: [
    IntigoProvider,
    FirstDeliveryProvider,
    AramexProvider,
    ShippingFactoryService,
    ShippingService,
  ],
  controllers: [ShippingController],
  exports: [ShippingService, ShippingFactoryService],
})
export class ShippingModule {}
