import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  _id?: string;
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  subdomain: string;

  @Prop({ required: false })
  ownerId: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: 'trial' })
  plan: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ type: Object, default: {} })
  limits: {
    maxProducts?: number;
    maxOrders?: number;
    maxUsers?: number;
  };

  @Prop({ type: Object, default: { status: 'trial' } })
  subscription: {
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    plan: string;
    startDate?: Date;
    endDate?: Date;
    trialEndsAt?: Date;
    cancelledAt?: Date;
  };

  @Prop({ type: Object, default: {} })
  integrations: {
    stripe?: {
      accountId?: string;
      livemode?: boolean;
      scope?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      refreshTokenEnc?: string;
      tokenType?: string;
      expiresAt?: Date;
      customerId?: string;
      keyVersion?: number; // For key rotation support
    };
    shopify?: {
      shop?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      mode?: string;
      lastWebhookAt?: Date;
      lastBackfillAt?: Date;
    };
    facebook?: {
      pageId?: string;
      pageName?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      refreshTokenEnc?: string;
      expiresAt?: Date;
      scope?: string;
      lastSyncAt?: Date;
    };
    instagram?: {
      accountId?: string;
      username?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      refreshTokenEnc?: string;
      expiresAt?: Date;
      scope?: string;
      lastSyncAt?: Date;
    };
    twitter?: {
      accountId?: string;
      username?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      refreshTokenEnc?: string;
      expiresAt?: Date;
      scope?: string;
      lastSyncAt?: Date;
    };
    linkedin?: {
      organizationId?: string;
      organizationName?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      refreshTokenEnc?: string;
      expiresAt?: Date;
      scope?: string;
      lastSyncAt?: Date;
    };
    tiktok?: {
      advertiserId?: string;
      advertiserName?: string;
      connectedAt?: Date;
      accessTokenEnc?: string;
      refreshTokenEnc?: string;
      expiresAt?: Date;
      scope?: string;
      lastSyncAt?: Date;
    };
    konnect?: {
      walletId?: string;
      apiKeyEnc?: string;
      sandbox?: boolean;
      connectedAt?: Date;
    };
    flouci?: {
      publicKeyEnc?: string;
      privateKeyEnc?: string;
      sandbox?: boolean;
      connectedAt?: Date;
    };
    cod?: {
      enabled?: boolean;
      otpRequired?: boolean;
      configuredAt?: Date;
    };
    paymee?: {
      apiKeyEnc?: string;
      vendorId?: string;
      sandbox?: boolean;
      connectedAt?: Date;
    };
    whatsapp?: {
      provider?: 'meta' | 'waha';
      businessNumber?: string;
      meta?: {
        phoneNumberId?: string;
        tokenEnc?: string;
        verifyToken?: string;
      };
      waha?: {
        url?: string;
        tokenEnc?: string;
      };
      configuredAt?: Date;
    };
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

