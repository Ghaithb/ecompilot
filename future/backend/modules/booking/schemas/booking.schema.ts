import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  DEPOSIT_PAID = 'deposit_paid',
  FULLY_PAID = 'fully_paid',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  customerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  staffId?: Types.ObjectId;

  // Customer Info (for guest bookings)
  @Prop({ type: String })
  customerName?: string;

  @Prop({ type: String })
  customerEmail?: string;

  @Prop({ type: String })
  customerPhone?: string;

  // Booking Details
  @Prop({ type: Date, required: true, index: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: Number, default: 60 })
  durationMinutes: number;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  // Pricing
  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, default: 0 })
  depositAmount: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: String })
  paymentIntentId?: string;

  // Notes & Metadata
  @Prop({ type: String })
  customerNotes?: string;

  @Prop({ type: String })
  internalNotes?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  // Reminders
  @Prop({ type: Boolean, default: false })
  reminderSent: boolean;

  @Prop({ type: Date })
  reminderSentAt?: Date;

  // Cancellation
  @Prop({ type: String })
  cancellationReason?: string;

  @Prop({ type: Date })
  cancelledAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes for performance
BookingSchema.index({ tenantId: 1, startTime: 1 });
BookingSchema.index({ tenantId: 1, staffId: 1, startTime: 1 });
BookingSchema.index({ tenantId: 1, status: 1 });
