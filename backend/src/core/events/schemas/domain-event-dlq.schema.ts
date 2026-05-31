import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DomainEventDlqDocument = DomainEventDlq & Document;

@Schema({ timestamps: true })
export class DomainEventDlq {
  @Prop({ required: true, index: true })
  eventId: string;

  @Prop({ required: true, index: true })
  eventName: string;

  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, unknown>;

  @Prop({ required: true })
  lastError: string;

  @Prop({ default: 0 })
  attempts: number;
}

export const DomainEventDlqSchema = SchemaFactory.createForClass(DomainEventDlq);
