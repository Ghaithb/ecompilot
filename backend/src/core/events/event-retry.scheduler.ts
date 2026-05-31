import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DomainEventLog,
  DomainEventLogDocument,
} from './schemas/domain-event-log.schema';

/** Re-emits failed events for idempotent handler retry. */
@Injectable()
export class EventRetryScheduler {
  private readonly logger = new Logger(EventRetryScheduler.name);
  private running = false;

  constructor(
    @InjectModel(DomainEventLog.name) private logModel: Model<DomainEventLogDocument>,
    private emitter: EventEmitter2,
  ) {}

  @Cron('*/2 * * * *')
  async retryFailedEvents() {
    if (this.running) return;
    this.running = true;

    try {
      const due = await this.logModel
        .find({
          status: 'failed',
          attempts: { $lt: 3 },
          nextRetryAt: { $lte: new Date() },
        })
        .limit(30);

      for (const log of due) {
        this.logger.warn(`Retry event ${log.eventId} (${log.eventName}) attempt ${log.attempts + 1}`);
        this.emitter.emit(log.eventName, {
          ...log.payload,
          eventId: log.eventId,
          _retry: true,
        });
      }
    } finally {
      this.running = false;
    }
  }
}
