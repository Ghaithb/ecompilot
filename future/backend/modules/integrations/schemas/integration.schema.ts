import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

export enum IntegrationProvider {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  GOOGLE = 'google',
  MAILCHIMP = 'mailchimp',
  SENDGRID = 'sendgrid',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class Integration {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, enum: IntegrationProvider })
  provider: IntegrationProvider;

  @Prop({ required: true, enum: IntegrationStatus, default: IntegrationStatus.PENDING })
  status: IntegrationStatus;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    webhookSecret?: string;
    [key: string]: any;
  };

  @Prop({ type: Object })
  config: {
    syncEnabled?: boolean;
    syncFrequency?: string; // 'realtime', 'hourly', 'daily'
    webhookUrl?: string;
    [key: string]: any;
  };

  @Prop({ type: Object })
  metadata: {
    lastSync?: Date;
    lastError?: string;
    syncCount?: number;
    [key: string]: any;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  connectedAt?: Date;

  @Prop()
  disconnectedAt?: Date;

  @Prop()
  lastUsedAt?: Date;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);

// Index pour recherche rapide
IntegrationSchema.index({ tenantId: 1, provider: 1 });
IntegrationSchema.index({ tenantId: 1, status: 1 });
IntegrationSchema.index({ tenantId: 1, isActive: 1 });
