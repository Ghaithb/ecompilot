import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop({ required: true })
  plan: string; // starter, growth, pro

  @Prop({ required: true })
  status: string; // active, canceled, past_due, unpaid

  @Prop({ required: true })
  currentPeriodStart: Date;

  @Prop({ required: true })
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop()
  canceledAt: Date;

  @Prop({ type: Object, default: {} })
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
    maxStores: number;
  };

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Index pour optimiser les requêtes
SubscriptionSchema.index({ tenantId: 1 }, { unique: true });
SubscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true });
SubscriptionSchema.index({ status: 1 });

