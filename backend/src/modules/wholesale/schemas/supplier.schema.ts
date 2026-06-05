import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  phone: string;

  @Prop()
  whatsapp: string;

  @Prop()
  facebook?: string;

  @Prop()
  website?: string;

  @Prop({ default: 1 })
  moq: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 'unknown' })
  responseRate: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  availableRegions: string[];
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
