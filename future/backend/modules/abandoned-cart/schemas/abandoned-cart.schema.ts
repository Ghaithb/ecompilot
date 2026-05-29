import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AbandonedCartDocument = AbandonedCart & Document;

@Schema({ timestamps: true })
export class AbandonedCart {
  @Prop({ required: true, type: Types.ObjectId })
  tenantId: Types.ObjectId;

  @Prop()
  customerEmail?: string;

  @Prop()
  sessionId?: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop({ type: Array, required: true })
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: false })
  recovered: boolean;

  @Prop()
  recoveredAt?: Date;

  @Prop()
  recoveryChannel?: string;

  @Prop({ default: 0 })
  remindersSent: number;

  @Prop()
  lastReminderAt?: Date;

  @Prop({ type: [Date] })
  reminderDates?: Date[];

  @Prop({ type: Array })
  channelAttempts?: Array<{
    channel: string;
    attemptedAt: Date;
    success: boolean;
    errorMessage?: string;
  }>;

  @Prop()
  recoveryCouponCode?: string;

  @Prop()
  nextReminderAt?: Date;

  @Prop({ default: 0 })
  reminderStage?: number;

  @Prop()
  storeSlug?: string;
}

export const AbandonedCartSchema = SchemaFactory.createForClass(AbandonedCart);

AbandonedCartSchema.index({ tenantId: 1, recovered: 1 });
AbandonedCartSchema.index({ createdAt: 1 });
