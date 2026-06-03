import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuoteRequestDocument = QuoteRequest & Document;

@Schema({ timestamps: true })
export class QuoteRequest {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Supplier', required: true })
  supplierIds: Types.ObjectId[];

  @Prop({ required: true })
  productTitle: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  notes?: string;

  @Prop({ default: 'pending' })
  status: string; // pending, quoted, closed
}

export const QuoteRequestSchema = SchemaFactory.createForClass(QuoteRequest);
