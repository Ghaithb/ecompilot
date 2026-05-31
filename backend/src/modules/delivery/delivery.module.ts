import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CodTrustModule } from '../cod-trust/cod-trust.module';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { DELIVERY_QUEUE_NAME } from './constants/delivery-queue.constants';
import { DeliveryController } from './delivery.controller';
import { DeliveryWebhookController } from './delivery-webhook.controller';
import { ShipmentsController } from './shipments.controller';
import { FirstDeliveryProvider } from './providers/first-delivery.provider';
import { IntigoProvider } from './providers/intigo.provider';
import { ShipperProvider } from './providers/shipper.provider';
import { DeliveryQueueProcessor } from './queue/delivery-queue.processor';
import { DeliveryQueueService } from './queue/delivery-queue.service';
import { ProviderCredential, ProviderCredentialSchema } from './schemas/provider-credential.schema';
import { Shipment, ShipmentSchema } from './schemas/shipment.schema';
import { DeliveryCredentialsService } from './services/delivery-credentials.service';
import { DeliveryProviderRegistry } from './services/delivery-provider-registry.service';
import { DeliveryService } from './services/delivery.service';
import { DeliveryShipmentService } from './services/delivery-shipment.service';
import { DeliveryWebhookHandler } from './services/delivery-webhook.handler';
import { DeliveryPollingService } from './services/delivery-polling.service';
import { OrderRiskEngineService } from './services/order-risk-engine.service';
import { DeliveryManifestService } from './services/delivery-manifest.service';

@Module({
  imports: [
    CodTrustModule,
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
      { name: ProviderCredential.name, schema: ProviderCredentialSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: DELIVERY_QUEUE_NAME }),
  ],
  controllers: [DeliveryController, DeliveryWebhookController, ShipmentsController],
  providers: [
    DeliveryProviderRegistry,
    DeliveryService,
    DeliveryShipmentService,
    DeliveryCredentialsService,
    DeliveryWebhookHandler,
    DeliveryPollingService,
    DeliveryQueueService,
    DeliveryQueueProcessor,
    OrderRiskEngineService,
    DeliveryManifestService,
    IntigoProvider,
    FirstDeliveryProvider,
    ShipperProvider,
  ],
  exports: [
    DeliveryService,
    DeliveryShipmentService,
    DeliveryProviderRegistry,
    OrderRiskEngineService,
    DeliveryManifestService,
  ],
})
export class DeliveryModule {}
