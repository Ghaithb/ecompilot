import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { AbandonedCart, AbandonedCartSchema } from './schemas/abandoned-cart.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Shipment, ShipmentSchema } from '../delivery/schemas/shipment.schema';
import { CartModule } from '../cart/cart.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { EventsModule } from '../../core/events/events.module';
import {
  ConversionDailyMetric,
  ConversionDailyMetricSchema,
} from './schemas/conversion-daily-metric.schema';
import {
  TenantRecoveryConfig,
  TenantRecoveryConfigSchema,
} from './schemas/tenant-recovery-config.schema';
import {
  TenantWhatsAppFlows,
  TenantWhatsAppFlowsSchema,
} from './schemas/whatsapp-flow.schema';
import { WhatsAppFlowsService } from './whatsapp-flows.service';
import { ConversionIntelligenceService } from './conversion-intelligence.service';
import { ConversionExperimentService } from './conversion-experiment.service';
import { ConversionMetricsService } from './conversion-metrics.service';
import { CheckoutOptimizationService } from './checkout-optimization.service';
import { RecoveryMessageEngine } from './recovery-message.engine';
import { RecoveryDecisionEngine } from './recovery-decision.engine';
import { CartConversionHandler } from './handlers/cart-conversion.handler';
import { SmartRecoveryScheduler } from './handlers/smart-recovery.scheduler';
import { ConversionDashboardController } from './conversion-dashboard.controller';
import { ConversionIntelligenceController } from './conversion-intelligence.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversionDailyMetric.name, schema: ConversionDailyMetricSchema },
      { name: TenantRecoveryConfig.name, schema: TenantRecoveryConfigSchema },
      { name: TenantWhatsAppFlows.name, schema: TenantWhatsAppFlowsSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Shipment.name, schema: ShipmentSchema },
      { name: AbandonedCart.name, schema: AbandonedCartSchema },
    ]),
    EventsModule,
    forwardRef(() => CartModule),
    DeliveryModule,
    WhatsAppModule,
],
  controllers: [ConversionDashboardController, ConversionIntelligenceController],
  providers: [
    ConversionIntelligenceService,
    ConversionExperimentService,
    ConversionMetricsService,
    CheckoutOptimizationService,
    RecoveryMessageEngine,
    RecoveryDecisionEngine,
    CartConversionHandler,
    SmartRecoveryScheduler,
    WhatsAppFlowsService,
  ],
  exports: [
    ConversionIntelligenceService,
    ConversionExperimentService,
    ConversionMetricsService,
    CheckoutOptimizationService,
    RecoveryMessageEngine,
    RecoveryDecisionEngine,
    WhatsAppFlowsService,
  ],
})
export class ConversionIntelligenceModule {}
