import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantSubscriptionDocument = TenantSubscription & Document;

@Schema({ timestamps: true })
export class TenantSubscription {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true, enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'] })
  status: string;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop({ required: true })
  currentPeriodStart: Date;

  @Prop({ required: true })
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop()
  trialEnd?: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TenantSubscriptionSchema = SchemaFactory.createForClass(TenantSubscription);





