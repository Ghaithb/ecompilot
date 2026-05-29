import { Module } from '@nestjs/common';
import { WhatsAppModule } from '../modules/whatsapp/whatsapp.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { DeliveryModule } from '../modules/delivery/delivery.module';

/**
 * Intégrations externes — aucune règle métier ici, uniquement adapters/providers.
 */
@Module({
  imports: [WhatsAppModule, PaymentModule, DeliveryModule],
  exports: [WhatsAppModule, PaymentModule, DeliveryModule],
})
export class IntegrationsModule {}
