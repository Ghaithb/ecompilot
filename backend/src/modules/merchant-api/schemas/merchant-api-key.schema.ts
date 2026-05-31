import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MerchantApiKeyDocument = MerchantApiKey & Document;

@Schema({ timestamps: true })
export class MerchantApiKey {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  keyPrefix: string;

  @Prop({ required: true })
  keyHash: string;

  @Prop()
  revokedAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MerchantApiKeySchema = SchemaFactory.createForClass(MerchantApiKey);
MerchantApiKeySchema.index({ tenantId: 1, revokedAt: 1 });
