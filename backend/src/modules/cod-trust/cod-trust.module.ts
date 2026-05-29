import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodTrustService } from './cod-trust.service';
import { CodTrustController } from './cod-trust.controller';
import { PhoneBlacklist, PhoneBlacklistSchema } from './schemas/phone-blacklist.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhoneBlacklist.name, schema: PhoneBlacklistSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [CodTrustController],
  providers: [CodTrustService],
  exports: [CodTrustService],
})
export class CodTrustModule {}
