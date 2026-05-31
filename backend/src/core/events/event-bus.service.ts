import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventName } from './domain-events.constants';
import {
  DomainEventLog,
  DomainEventLogDocument,
} from './schemas/domain-event-log.schema';

export interface DomainEventEnvelope<T extends Record<string, unknown> = Record<string, unknown>> {
  eventId: string;
  occurredAt: Date;
  tenantId: string;
  _retry?: boolean;
  [key: string]: unknown;
}

/**
 * Event bus — persists every event, supports idempotent handlers + retry/DLQ.
 */
@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private readonly emitter: EventEmitter2,
    @InjectModel(DomainEventLog.name) private logModel: Model<DomainEventLogDocument>,
  ) {}

  async publish<T extends Record<string, unknown>>(
    event: DomainEventName,
    payload: T,
  ): Promise<string> {
    const eventId = randomUUID();
    const tenantId = String(payload.tenantId || 'unknown');
    const occurredAt = new Date();

    const envelope: DomainEventEnvelope<T> = {
      ...payload,
      eventId,
      tenantId,
      occurredAt,
    };

    await this.logModel.create({
      eventId,
      eventName: event,
      tenantId,
      payload: envelope as Record<string, unknown>,
      status: 'pending',
      attempts: 0,
      processedHandlers: [],
    });

    this.logger.debug(`Event ${event} id=${eventId} tenant=${tenantId}`);
    this.emitter.emit(event, envelope);
    return eventId;
  }

  /** Fire-and-forget wrapper for legacy call sites. */
  publishSync<T extends Record<string, unknown>>(event: DomainEventName, payload: T): void {
    void this.publish(event, payload);
  }
}
