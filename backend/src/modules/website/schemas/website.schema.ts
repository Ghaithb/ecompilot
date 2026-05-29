import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebsiteDocument = Website & Document;

@Schema({ timestamps: true })
export class Website {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  slug: string; // URL unique : ma-boutique

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object })
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    font: string;
    logo?: string;
    favicon?: string;
  };

  @Prop({ type: Boolean, default: false })
  published: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Un seul site actif par tenant à la fois

  @Prop({ type: Object })
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };

  @Prop({ type: Object })
  settings: {
    enableCart: boolean;
    enableCheckout: boolean;
    enableContact: boolean;
    currency: string;
    language: string;
    timezone: string;
  };

  // Fonctionnalités modulaires activables
  @Prop({ type: Object })
  features: {
    // E-commerce
    ecommerce: {
      enabled: boolean;
      paymentMethods?: string[]; // ['card', 'paypal', 'bank_transfer']
      shippingMethods?: string[]; // ['standard', 'express']
      taxRate?: number;
    };
    // Réservation/Booking
    booking: {
      enabled: boolean;
      maxGuestsPerSlot?: number;
      bookingDuration?: number; // en minutes
      availableTimeSlots?: string[];
      advanceBookingDays?: number;
    };
    // Contact & Messages
    contact: {
      enabled: boolean;
      autoReply?: boolean;
      notificationEmail?: string;
    };
    // Newsletter
    newsletter: {
      enabled: boolean;
      provider?: string; // 'internal', 'mailchimp', 'sendgrid'
      welcomeEmail?: boolean;
    };
    // Blog
    blog: {
      enabled: boolean;
      commentsEnabled?: boolean;
      categoriesEnabled?: boolean;
    };
    // Galerie
    gallery: {
      enabled: boolean;
      allowUpload?: boolean;
      maxImages?: number;
    };
    // Services (pour niches spécifiques)
    services: {
      enabled: boolean;
      customServices?: Array<{
        id: string;
        name: string;
        description: string;
        price?: number;
        duration?: number;
        icon?: string;
      }>;
    };
    // Témoignages/Reviews
    reviews: {
      enabled: boolean;
      moderationRequired?: boolean;
      allowRatings?: boolean;
    };
    // FAQ
    faq: {
      enabled: boolean;
      categories?: string[];
    };
    // Multi-langue
    multiLanguage: {
      enabled: boolean;
      languages?: string[]; // ['fr', 'en', 'es']
      defaultLanguage?: string;
    };
  };

  @Prop({ type: Object })
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    enableTracking: boolean;
  };

  @Prop({ type: Object })
  domain: {
    customDomain?: string;
    sslEnabled: boolean;
  };

  // Type de business/niche
  @Prop({ type: String })
  businessType?: string; // 'parfum', 'restaurant', 'salon', 'ecommerce', 'portfolio', 'agency', etc.

  // Configuration personnalisée pour chaque niche
  @Prop({ type: Object })
  businessConfig?: {
    industry?: string;
    targetAudience?: string;
    uniqueSellingPoints?: string[];
    customFields?: Record<string, any>;
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const WebsiteSchema = SchemaFactory.createForClass(Website);

// Indexes
WebsiteSchema.index({ tenantId: 1 });
WebsiteSchema.index({ slug: 1 }, { unique: true });
WebsiteSchema.index({ published: 1 });
