import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailCampaignDocument = EmailCampaign & Document;

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum CampaignType {
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  ABANDONED_CART = 'abandoned_cart',
  WELCOME = 'welcome',
  FOLLOW_UP = 'follow_up',
}

@Schema({ timestamps: true })
export class EmailCampaign {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subject: string;

  @Prop()
  preheader?: string;

  @Prop({ required: true, enum: CampaignType })
  type: CampaignType;

  @Prop({ required: true, enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop({ type: String, ref: 'EmailTemplate' })
  templateId?: string;

  @Prop({ required: true })
  content: string; // HTML content

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  audience: {
    segmentId?: string;
    subscriberIds?: string[];
    filters?: any;
    totalRecipients?: number;
  };

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop({ type: Object })
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate?: number;
    clickRate?: number;
    revenue?: number;
  };

  @Prop({ type: Object })
  settings: {
    trackOpens: boolean;
    trackClicks: boolean;
    allowUnsubscribe: boolean;
    replyTo?: string;
    fromName?: string;
    fromEmail?: string;
  };
}

export const EmailCampaignSchema = SchemaFactory.createForClass(EmailCampaign);

// Indexes
EmailCampaignSchema.index({ tenantId: 1, status: 1 });
EmailCampaignSchema.index({ tenantId: 1, type: 1 });
EmailCampaignSchema.index({ scheduledAt: 1 });
