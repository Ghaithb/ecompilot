import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ABTestDocument = ABTest & Document;

@Schema({ timestamps: true })
export class ABTest {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Page' })
  pageId: Types.ObjectId;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string; // Nom du test

  @Prop({ type: String })
  description: string;

  @Prop({ required: true, enum: ['active', 'paused', 'completed'], default: 'active' })
  status: string;

  @Prop({ type: Object })
  variantA: {
    name: string;
    content: any;
    html: string;
    css: string;
    views: number;
    conversions: number;
    conversionRate: number;
  };

  @Prop({ type: Object })
  variantB: {
    name: string;
    content: any;
    html: string;
    css: string;
    views: number;
    conversions: number;
    conversionRate: number;
  };

  @Prop({ type: Number, default: 50 })
  trafficSplit: number; // Pourcentage de trafic pour la variante B (0-100)

  @Prop({ type: String })
  goal: string; // Objectif du test (ex: "click_button", "form_submit")

  @Prop({ type: Number, default: 0 })
  totalViews: number;

  @Prop({ type: Number, default: 0 })
  totalConversions: number;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ type: String })
  winner: string; // 'A', 'B', or null

  @Prop({ type: Number })
  confidence: number; // Niveau de confiance statistique (0-100)

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ABTestSchema = SchemaFactory.createForClass(ABTest);

// Indexes
ABTestSchema.index({ pageId: 1, status: 1 });
ABTestSchema.index({ tenantId: 1, status: 1 });
ABTestSchema.index({ startDate: 1, endDate: 1 });
