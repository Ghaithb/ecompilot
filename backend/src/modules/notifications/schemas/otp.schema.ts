import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  purpose: string; // e.g., 'order_verification'

  @Prop({ type: Types.ObjectId })
  referenceId: Types.ObjectId; // e.g., orderId

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Expire auto après 15 minutes (si expiresAt est défini)
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ tenantId: 1, phone: 1, code: 1, isUsed: 1 });
