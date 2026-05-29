import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiscountCodeDocument = DiscountCode & Document;

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

@Schema({ timestamps: true })
export class DiscountCode {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: DiscountType })
  type: DiscountType;

  @Prop({ required: true })
  value: number; // percentage or fixed amount

  @Prop()
  minOrderAmount?: number;

  @Prop()
  maxDiscount?: number;

  @Prop()
  usageLimit?: number;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String] })
  applicableProducts?: string[];

  @Prop({ type: [String] })
  applicableCategories?: string[];
}

export const DiscountCodeSchema = SchemaFactory.createForClass(DiscountCode);

DiscountCodeSchema.index({ tenantId: 1, isActive: 1 });
DiscountCodeSchema.index({ code: 1 }, { unique: true });
