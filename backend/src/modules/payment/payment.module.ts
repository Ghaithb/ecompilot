import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TunisiaPaymentService } from './tunisia-payment.service';
import { KonnectProvider } from './providers/konnect.provider';
import { FlouciProvider } from './providers/flouci.provider';
import { CurrencyModule } from '../currency/currency.module';
import { TenantsModule } from '../tenants/tenants.module';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [
    CurrencyModule,
    TenantsModule,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, TunisiaPaymentService, KonnectProvider, FlouciProvider],
  exports: [PaymentService, TunisiaPaymentService],
})
export class PaymentModule {}
