import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { TenantSubscription, TenantSubscriptionSchema } from './subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: TenantSubscription.name, schema: TenantSubscriptionSchema },
    ]),
  ],
  controllers: [BillingController, SubscriptionController],
  providers: [BillingService, StripeService, SubscriptionService],
  exports: [StripeService, SubscriptionService],
})
export class BillingModule {}
