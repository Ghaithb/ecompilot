import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppMessage, WhatsAppMessageSchema } from './schemas/whatsapp-message.schema';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: WhatsAppMessage.name, schema: WhatsAppMessageSchema },
    ]),
  ],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  providers: [WhatsAppService, MetaWhatsAppProvider],
  exports: [WhatsAppService, MetaWhatsAppProvider],
})
export class WhatsAppModule {}
