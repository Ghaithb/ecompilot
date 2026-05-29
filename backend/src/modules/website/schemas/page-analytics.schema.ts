import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageAnalyticsDocument = PageAnalytics & Document;

@Schema({ timestamps: true })
export class PageAnalytics {
  @Prop({ required: true })
  pageId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  uniqueVisitors: number;

  @Prop({ default: 0 })
  bounces: number;

  @Prop({ default: 0 })
  avgTimeOnPage: number; // en secondes

  @Prop({ type: Object, default: {} })
  sources: {
    direct?: number;
    search?: number;
    social?: number;
    referral?: number;
  };

  @Prop({ type: Object, default: {} })
  devices: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };

  @Prop({ type: [String], default: [] })
  topReferrers: string[];
}

export const PageAnalyticsSchema = SchemaFactory.createForClass(PageAnalytics);

// Index pour recherche rapide
PageAnalyticsSchema.index({ pageId: 1, date: -1 });
PageAnalyticsSchema.index({ tenantId: 1, date: -1 });
