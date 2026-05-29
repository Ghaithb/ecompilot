import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Plan' })
  planId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop({ default: 'active', enum: ['active', 'past_due', 'canceled', 'unpaid'] })
  status: string;

  @Prop()
  currentPeriodStart: Date;

  @Prop()
  currentPeriodEnd: Date;

  @Prop()
  cancelAtPeriodEnd: boolean;

  @Prop()
  canceledAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);