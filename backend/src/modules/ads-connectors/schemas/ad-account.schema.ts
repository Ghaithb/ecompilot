import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdAccountDocument = AdAccount & Document;

@Schema({ timestamps: true })
export class AdAccount {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, enum: ['google_ads', 'meta_ads', 'tiktok_ads', 'linkedin_ads'] })
  platform: string;

  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true })
  accessTokenEnc: string;

  @Prop()
  refreshTokenEnc?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: 'active', enum: ['active', 'expired', 'revoked', 'error'] })
  status: string;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AdAccountSchema = SchemaFactory.createForClass(AdAccount);

AdAccountSchema.index({ tenantId: 1, platform: 1 });
AdAccountSchema.index({ tenantId: 1, accountId: 1 }, { unique: true });
