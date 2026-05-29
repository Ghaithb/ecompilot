import { Module } from '@nestjs/common';
import { DeliveryModule } from '../modules/delivery/delivery.module';

/** Intégrations transporteurs TN (INTIGO, First Delivery, etc.) */
@Module({
  imports: [DeliveryModule],
  exports: [DeliveryModule],
})
export class DeliveryAppModule {}
