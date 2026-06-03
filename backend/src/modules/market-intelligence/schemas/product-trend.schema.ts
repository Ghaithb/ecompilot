import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductTrendDocument = ProductTrend & Document;

@Schema({ timestamps: true })
export class ProductTrend {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  salesVolume: number;

  @Prop({ default: 0 })
  revenue: number;

  @Prop({ default: 0 })
  deliverySuccessRate: number;

  @Prop({ type: [String], default: [] })
  topProvinces: string[];

  @Prop({ type: Object, default: {} })
  carrierPerformance: Record<string, number>;

  @Prop({ default: 0 })
  trendScore: number;

  @Prop({ default: Date.now })
  calculatedAt: Date;
}

export const ProductTrendSchema = SchemaFactory.createForClass(ProductTrend);
