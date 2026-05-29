import { Module } from '@nestjs/common';
import { AramexProvider } from './providers/aramex.provider';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';

@Module({
  providers: [AramexProvider, ShippingService],
  controllers: [ShippingController],
  exports: [AramexProvider, ShippingService],
})
export class ShippingModule {}
