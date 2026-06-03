import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppMessage, WhatsAppMessageSchema } from './schemas/whatsapp-message.schema';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import { WahaProvider } from './providers/waha.provider';
import { WhatsappOrderNotificationService } from './whatsapp-order-notification.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: WhatsAppMessage.name, schema: WhatsAppMessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  providers: [WhatsAppService, MetaWhatsAppProvider, WahaProvider, WhatsappOrderNotificationService],
  exports: [WhatsAppService, MetaWhatsAppProvider, WahaProvider, WhatsappOrderNotificationService],
})
export class WhatsAppModule {}
