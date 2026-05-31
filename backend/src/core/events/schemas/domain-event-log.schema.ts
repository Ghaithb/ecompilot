import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DomainEventLogDocument = DomainEventLog & Document;

@Schema({ timestamps: true })
export class DomainEventLog {
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  eventName: string;

  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, unknown>;

  @Prop({
    enum: ['pending', 'processed', 'failed', 'dlq'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  lastError?: string;

  @Prop({ type: [String], default: [] })
  processedHandlers: string[];

  @Prop()
  nextRetryAt?: Date;
}

export const DomainEventLogSchema = SchemaFactory.createForClass(DomainEventLog);
DomainEventLogSchema.index({ status: 1, nextRetryAt: 1, attempts: 1 });
DomainEventLogSchema.index({ tenantId: 1, eventName: 1, createdAt: -1 });
