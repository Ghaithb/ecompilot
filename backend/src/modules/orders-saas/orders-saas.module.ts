import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from '../orders/orders.module';
import { OrdersSaasController } from './orders-saas.controller';
import { OrdersSaasRepository } from './orders-saas.repository';
import { OrdersSaasService } from './orders-saas.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    OrdersModule,
  ],
  controllers: [OrdersSaasController],
  providers: [OrdersSaasRepository, OrdersSaasService],
  exports: [OrdersSaasService, OrdersSaasRepository],
})
export class OrdersSaasModule {}
