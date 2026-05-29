import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PhoneBlacklistDocument = PhoneBlacklist & Document;

@Schema({ timestamps: true })
export class PhoneBlacklist {
  @Prop({ type: Types.ObjectId, required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  phone: string;

  @Prop()
  reason?: string;

  @Prop()
  addedBy?: string;
}

export const PhoneBlacklistSchema = SchemaFactory.createForClass(PhoneBlacklist);
PhoneBlacklistSchema.index({ tenantId: 1, phone: 1 }, { unique: true });
