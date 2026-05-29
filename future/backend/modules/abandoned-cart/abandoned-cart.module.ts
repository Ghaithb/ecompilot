import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbandonedCartController } from './abandoned-cart.controller';
import { AbandonedCartService } from './abandoned-cart.service';
import { AbandonedCart, AbandonedCartSchema } from './schemas/abandoned-cart.schema';
import { MarketingModule } from '../marketing/marketing.module';

import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AbandonedCart.name, schema: AbandonedCartSchema },
    ]),
    forwardRef(() => MarketingModule),
    RealtimeModule,
  ],
  controllers: [AbandonedCartController],
  providers: [AbandonedCartService],
  exports: [AbandonedCartService],
})
export class AbandonedCartModule {}
