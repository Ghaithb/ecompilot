import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop()
  orderId?: string;

  @Prop({ type: [String] })
  images?: string[];

  @Prop()
  reply?: string;

  @Prop()
  repliedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ tenantId: 1, productId: 1 });
ReviewSchema.index({ tenantId: 1, isPublished: 1 });
