import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversionDailyMetricDocument = ConversionDailyMetric & Document;

@Schema({ timestamps: true })
export class ConversionDailyMetric {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  dateKey: string;

  @Prop({ default: 0 })
  cartsCreated: number;

  @Prop({ default: 0 })
  cartsAbandoned: number;

  @Prop({ default: 0 })
  checkoutsStarted: number;

  @Prop({ default: 0 })
  checkoutsCompleted: number;

  @Prop({ default: 0 })
  ordersCreated: number;

  @Prop({ default: 0 })
  shipmentsCreated: number;

  @Prop({ default: 0 })
  recoveriesSent: number;

  @Prop({ default: 0 })
  recoveriesConverted: number;

  @Prop({ default: 0 })
  revenueRecovered: number;

  @Prop({ default: 0 })
  abandonedValue: number;

  @Prop({ type: Object, default: {} })
  experiments: {
    checkoutA?: { started: number; completed: number };
    checkoutB?: { started: number; completed: number };
    recoveryVariants?: Record<string, { sent: number; converted: number }>;
  };

  @Prop({ type: Object, default: {} })
  channels: {
    email?: { sent: number; converted: number };
    whatsapp?: { sent: number; converted: number };
    sms?: { sent: number; converted: number };
  };

  @Prop({ type: Object, default: {} })
  storefront: {
    views?: number;
    mobileViews?: number;
    desktopViews?: number;
    addToCart?: number;
    purchases?: number;
    productViews?: Record<string, number>;
  };
}

export const ConversionDailyMetricSchema = SchemaFactory.createForClass(ConversionDailyMetric);
ConversionDailyMetricSchema.index({ tenantId: 1, dateKey: 1 }, { unique: true });
