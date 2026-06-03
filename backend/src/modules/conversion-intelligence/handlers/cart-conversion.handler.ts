import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DomainEvents } from '../../../core/events/domain-events.constants';
import {
  CartAbandonedPayload,
  CartEventPayload,
  CartRecoveredPayload,
  CheckoutEventPayload,
  OrderEventPayload,
  RecoveryEventPayload,
  ShipmentEventPayload,
} from '../../../core/events/domain-event.payloads';
import { EventIdempotencyService } from '../../../core/events/event-idempotency.service';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { ConversionIntelligenceService } from '../conversion-intelligence.service';
import { ConversionMetricsService } from '../conversion-metrics.service';

@Injectable()
export class CartConversionHandler {
  private readonly logger = new Logger(CartConversionHandler.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private intelligence: ConversionIntelligenceService,
    private metrics: ConversionMetricsService,
    private idempotency: EventIdempotencyService,
  ) {}

  @OnEvent(DomainEvents.CART_CREATED)
  async onCartCreated(payload: CartEventPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onCartCreated', async () => {
      await this.metrics.increment(payload.tenantId, 'cartsCreated');
    });
  }

  @OnEvent(DomainEvents.CART_ABANDONED)
  async onCartAbandoned(payload: CartAbandonedPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onCartAbandoned', async () => {
      const cart = await this.cartModel.findById(payload.cartId);
      if (!cart) return;

      const intel = this.intelligence.analyzeCart(cart);
      this.intelligence.appendScoreHistory(cart, intel);

      const delay = this.intelligence.getRecoveryDelayMinutes(intel);
      cart.nextRecoveryAt = delay ? new Date(Date.now() + delay * 60 * 1000) : undefined;
      await cart.save();

      await this.metrics.increment(payload.tenantId, 'cartsAbandoned');
      await this.metrics.increment(payload.tenantId, 'abandonedValue', payload.total || cart.totals?.total || 0);

      this.logger.log(
        `Cart ${payload.cartId} abandoned score=${intel.conversionScore} urgency=${intel.urgencyLevel}`,
      );
    });
  }

  @OnEvent(DomainEvents.CART_RECOVERED)
  async onCartRecovered(payload: CartRecoveredPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onCartRecovered', async () => {
      await this.metrics.increment(payload.tenantId, 'recoveriesConverted');
      if (payload.revenue) {
        await this.metrics.increment(payload.tenantId, 'revenueRecovered', payload.revenue);
      }
    });
  }

  @OnEvent(DomainEvents.CHECKOUT_STARTED)
  async onCheckoutStarted(payload: CheckoutEventPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onCheckoutStarted', async () => {
      await this.metrics.increment(payload.tenantId, 'checkoutsStarted');
      const field =
        payload.checkoutVersion === 'B'
          ? 'experiments.checkoutB.started'
          : 'experiments.checkoutA.started';
      await this.metrics.increment(payload.tenantId, field);
    });
  }

  @OnEvent(DomainEvents.CHECKOUT_COMPLETED)
  async onCheckoutCompleted(payload: CheckoutEventPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onCheckoutCompleted', async () => {
      await this.metrics.increment(payload.tenantId, 'checkoutsCompleted');
      const field =
        payload.checkoutVersion === 'B'
          ? 'experiments.checkoutB.completed'
          : 'experiments.checkoutA.completed';
      await this.metrics.increment(payload.tenantId, field);
    });
  }

  @OnEvent(DomainEvents.ORDER_CREATED)
  async onOrderCreated(payload: OrderEventPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onOrderCreated', async () => {
      await this.metrics.increment(payload.tenantId, 'ordersCreated');
    });
  }

  @OnEvent(DomainEvents.SHIPMENT_CREATED)
  async onShipmentCreated(payload: ShipmentEventPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onShipmentCreated', async () => {
      await this.metrics.increment(payload.tenantId, 'shipmentsCreated');
    });
  }

  @OnEvent(DomainEvents.RECOVERY_SENT)
  async onRecoverySent(payload: RecoveryEventPayload) {
    await this.idempotency.runHandler(payload.eventId, 'CartConversionHandler.onRecoverySent', async () => {
      await this.metrics.increment(payload.tenantId, 'recoveriesSent');
      const channelField = `channels.${payload.channel}.sent`;
      await this.metrics.increment(payload.tenantId, channelField);
      if (payload.variant) {
        await this.metrics.increment(
          payload.tenantId,
          `experiments.recoveryVariants.${payload.variant}.sent`,
        );
      }
    });
  }
}
