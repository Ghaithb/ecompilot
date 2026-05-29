import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { MultiChannelOrchestratorService } from './multi-channel-orchestrator.service';
import { AbandonedCartRecoveryController } from './abandoned-cart-recovery.controller';
import { AbandonedCart, AbandonedCartSchema } from '../abandoned-cart/schemas/abandoned-cart.schema';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: AbandonedCart.name, schema: AbandonedCartSchema },
    ]),
    WhatsAppModule,
    NotificationsModule,
  ],
  controllers: [MarketingController, AbandonedCartRecoveryController],
  providers: [MarketingService, MultiChannelOrchestratorService],
  exports: [MarketingService, MultiChannelOrchestratorService],
})
export class MarketingModule {}
