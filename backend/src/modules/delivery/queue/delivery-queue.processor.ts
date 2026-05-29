import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import {
  DELIVERY_QUEUE_NAME,
  DeliveryJobName,
  DeliveryQueuePayload,
} from '../constants/delivery-queue.constants';
import { DeliveryService } from '../services/delivery.service';

@Processor(DELIVERY_QUEUE_NAME)
export class DeliveryQueueProcessor {
  private readonly logger = new Logger(DeliveryQueueProcessor.name);

  constructor(private delivery: DeliveryService) {}

  @Process(DeliveryJobName.CREATE_SHIPMENT)
  async handleCreate(job: Job<DeliveryQueuePayload>) {
    this.logger.log(`Processing job ${job.id} order=${job.data.orderId}`);
    return this.delivery.processQueuedCreate(job.data);
  }

  @OnQueueFailed()
  onFailed(job: Job<DeliveryQueuePayload>, error: Error) {
    this.logger.error(
      `Job ${job.id} failed (${job.data.orderId}): ${error.message}`,
      error.stack,
    );
  }
}
