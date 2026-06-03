import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WholesaleProductDocument = WholesaleProduct & Document;

@Schema({ timestamps: true })
export class WholesaleProduct {
  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ required: true })
  wholesalePrice: number;

  @Prop({ required: true })
  retailPriceEstimate: number;

  @Prop({ default: 'in_stock' })
  stockStatus: string; // in_stock, limited, out_of_stock

  @Prop({ default: 1 })
  moq: number;

  @Prop()
  category: string;
}

export const WholesaleProductSchema = SchemaFactory.createForClass(WholesaleProduct);
