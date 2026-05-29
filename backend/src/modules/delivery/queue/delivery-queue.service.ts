import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  DELIVERY_QUEUE_NAME,
  DeliveryJobName,
  DeliveryQueuePayload,
} from '../constants/delivery-queue.constants';

@Injectable()
export class DeliveryQueueService {
  private readonly logger = new Logger(DeliveryQueueService.name);

  constructor(
    private config: ConfigService,
    @InjectQueue(DELIVERY_QUEUE_NAME) private readonly queue: Queue<DeliveryQueuePayload>,
  ) {}

  isEnabled(): boolean {
    return (
      Boolean(this.config.get('redis.host')) &&
      this.config.get('delivery.queueEnabled') === true
    );
  }

  async enqueueCreate(payload: Omit<DeliveryQueuePayload, 'attempt'>) {
    if (!this.isEnabled()) {
      return false;
    }

    const job = await this.queue.add(DeliveryJobName.CREATE_SHIPMENT, payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    });

    this.logger.log(
      `Job ${job.id} enqueued order=${payload.orderId} provider=${payload.providerId}`,
    );
    return true;
  }
}
