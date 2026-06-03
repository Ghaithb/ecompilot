import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvents } from '../../core/events/domain-events.constants';
import { AutomationService } from './automation.service';

@Injectable()
export class AutomationOrderHandler {
  private readonly logger = new Logger(AutomationOrderHandler.name);

  constructor(private readonly automation: AutomationService) {}

  @OnEvent(DomainEvents.ORDER_CREATED)
  async onOrderCreated(payload: Record<string, unknown>) {
    await this.dispatch(payload, 'order.created');
  }

  @OnEvent(DomainEvents.SHIPMENT_CREATED)
  async onShipmentCreated(payload: Record<string, unknown>) {
    await this.dispatch(payload, 'shipment.delayed'); // Or another trigger mapping
  }

  private async dispatch(payload: Record<string, unknown>, trigger: string) {
    const tenantId = String(payload.tenantId || '');
    if (!tenantId) return;

    try {
      await this.automation.dispatch(tenantId, trigger as any, payload);
    } catch (err) {
      this.logger.warn(`Automation dispatch failed for trigger ${trigger}: ${err}`);
    }
  }
}
