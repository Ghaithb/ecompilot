import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DomainEventLog,
  DomainEventLogDocument,
} from './schemas/domain-event-log.schema';
import {
  DomainEventDlq,
  DomainEventDlqDocument,
} from './schemas/domain-event-dlq.schema';

/** Idempotent handler execution + retry/DLQ bookkeeping. */
@Injectable()
export class EventIdempotencyService {
  private readonly logger = new Logger(EventIdempotencyService.name);
  private readonly maxAttempts = 3;

  constructor(
    @InjectModel(DomainEventLog.name) private logModel: Model<DomainEventLogDocument>,
    @InjectModel(DomainEventDlq.name) private dlqModel: Model<DomainEventDlqDocument>,
  ) {}

  async runHandler(
    eventId: string | undefined,
    handlerName: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    if (!eventId) {
      await fn();
      return;
    }

    const log = await this.logModel.findOne({ eventId });
    if (!log) {
      await fn();
      return;
    }

    if (log.processedHandlers.includes(handlerName)) return;

    try {
      await fn();
      log.processedHandlers.push(handlerName);
      log.status = 'processed';
      log.lastError = undefined;
      await log.save();
    } catch (error) {
      log.attempts += 1;
      log.lastError = (error as Error).message;
      log.status = 'failed';
      log.nextRetryAt = new Date(Date.now() + log.attempts * 60_000);

      if (log.attempts >= this.maxAttempts) {
        await this.dlqModel.create({
          eventId: log.eventId,
          eventName: log.eventName,
          tenantId: log.tenantId,
          payload: log.payload,
          lastError: log.lastError,
          attempts: log.attempts,
        });
        log.status = 'dlq';
        this.logger.error(`Event ${eventId} → DLQ (${handlerName})`);
      }

      await log.save();
      throw error;
    }
  }

  async listRecent(tenantId: string, limit = 50) {
    return this.logModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async listDlq(tenantId: string, limit = 50) {
    return this.dlqModel.find({ tenantId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}
