import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerSegmentsService } from './customer-segments.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomerSegment, CustomerSegmentSchema } from './schemas/customer-segment.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerSegment.name, schema: CustomerSegmentSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerSegmentsService],
  exports: [CustomersService, CustomerSegmentsService, MongooseModule],
})
export class CustomersModule {}
