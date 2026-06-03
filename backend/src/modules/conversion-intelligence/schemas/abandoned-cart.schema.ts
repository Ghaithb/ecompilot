import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AbandonedCartDocument = AbandonedCart & Document;

@Schema({ timestamps: true })
export class AbandonedCart {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cart', required: true })
  cartId: Types.ObjectId;

  @Prop({ required: true })
  customerPhone: string;

  @Prop()
  customerEmail?: string;

  @Prop({ type: Object, required: true })
  cartData: any;

  @Prop({ default: 0 })
  conversionScore: number;

  @Prop({ default: 'pending' })
  status: 'pending' | 'recovered' | 'expired' | 'reminded';

  @Prop({ default: 0 })
  reminderCount: number;

  @Prop()
  lastReminderAt?: Date;

  @Prop()
  recoveredAt?: Date;

  @Prop({ type: [String], default: [] })
  frictionFlags: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const AbandonedCartSchema = SchemaFactory.createForClass(AbandonedCart);
AbandonedCartSchema.index({ tenantId: 1, status: 1 });
AbandonedCartSchema.index({ customerPhone: 1 });
AbandonedCartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
