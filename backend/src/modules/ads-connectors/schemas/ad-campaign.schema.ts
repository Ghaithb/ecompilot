import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdCampaignDocument = AdCampaign & Document;

@Schema({ timestamps: true })
export class AdCampaign {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  campaignId: string;

  @Prop({ required: true })
  campaignName: string;

  @Prop({ required: true })
  accountId: string;

  @Prop({ default: 'active', enum: ['active', 'paused', 'ended', 'deleted'] })
  status: string;

  @Prop({ type: Object, default: {} })
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
    ctr?: number;
    cpc?: number;
    cpa?: number;
    roas?: number;
    reach?: number;
    frequency?: number;
  };

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: Object, default: {} })
  targeting: Record<string, any>;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AdCampaignSchema = SchemaFactory.createForClass(AdCampaign);

AdCampaignSchema.index({ tenantId: 1, platform: 1 });
AdCampaignSchema.index({ tenantId: 1, campaignId: 1 });
AdCampaignSchema.index({ lastSyncAt: 1 });
