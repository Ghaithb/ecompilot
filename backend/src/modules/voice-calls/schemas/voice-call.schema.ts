import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoiceCallDocument = VoiceCall & Document;

export enum CallStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
  BUSY = 'busy',
  CANCELLED = 'cancelled',
}

export enum CallPurpose {
  ABANDONED_CART = 'abandoned_cart',
  ORDER_CONFIRMATION = 'order_confirmation',
  DELIVERY_UPDATE = 'delivery_update',
  PAYMENT_REMINDER = 'payment_reminder',
  PROMOTIONAL = 'promotional',
  CUSTOMER_SURVEY = 'customer_survey',
}

@Schema({ timestamps: true })
export class VoiceCall {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  customerPhone: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerEmail?: string;

  @Prop({ type: String, enum: CallPurpose, required: true })
  purpose: CallPurpose;

  @Prop({ type: String, enum: CallStatus, default: CallStatus.PENDING })
  status: CallStatus;

  @Prop()
  abandonedCartId?: string;

  @Prop()
  orderId?: string;

  @Prop({ type: Object })
  callData?: {
    products?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    totalAmount?: number;
    discountCode?: string;
    discountAmount?: number;
    deliveryInfo?: any;
  };

  @Prop()
  twilioCallSid?: string; // Twilio Call ID

  @Prop()
  duration?: number; // en secondes

  @Prop()
  recordingUrl?: string;

  @Prop()
  transcription?: string;

  @Prop({ type: Object })
  aiResponse?: {
    intent?: string;
    sentiment?: string;
    keyPhrases?: string[];
    customerInterest?: 'high' | 'medium' | 'low' | 'none';
    followUpNeeded?: boolean;
  };

  @Prop()
  scheduledFor?: Date;

  @Prop()
  initiatedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  lastRetryAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const VoiceCallSchema = SchemaFactory.createForClass(VoiceCall);

// Index pour optimiser les requêtes
VoiceCallSchema.index({ tenantId: 1, status: 1 });
VoiceCallSchema.index({ tenantId: 1, purpose: 1 });
VoiceCallSchema.index({ tenantId: 1, customerPhone: 1 });
VoiceCallSchema.index({ abandonedCartId: 1 });
VoiceCallSchema.index({ scheduledFor: 1, status: 1 });
VoiceCallSchema.index({ createdAt: -1 });
