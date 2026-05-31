import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { EventBusService } from './event-bus.service';
import { EventIdempotencyService } from './event-idempotency.service';
import { EventRetryScheduler } from './event-retry.scheduler';
import {
  DomainEventLog,
  DomainEventLogSchema,
} from './schemas/domain-event-log.schema';
import {
  DomainEventDlq,
  DomainEventDlqSchema,
} from './schemas/domain-event-dlq.schema';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.', maxListeners: 30 }),
    MongooseModule.forFeature([
      { name: DomainEventLog.name, schema: DomainEventLogSchema },
      { name: DomainEventDlq.name, schema: DomainEventDlqSchema },
    ]),
  ],
  providers: [EventBusService, EventIdempotencyService, EventRetryScheduler],
  exports: [EventBusService, EventIdempotencyService, EventEmitterModule],
})
export class EventsModule {}
