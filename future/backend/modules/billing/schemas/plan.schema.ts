import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanFeatures = {
  maxProducts: number;
  maxUsers: number;
  maxStorage: number; // en MB
  aiFeatures: boolean;
  customDomain: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
};

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  stripeProductId: string;

  @Prop({ required: true })
  stripePriceId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  interval: 'month' | 'year';

  @Prop({ required: true, type: Object })
  features: PlanFeatures;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;
}

export type PlanDocument = Plan & Document;
export const PlanSchema = SchemaFactory.createForClass(Plan);