import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerSegmentDocument = CustomerSegment & Document;

@Schema({ timestamps: true })
export class CustomerSegment {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  minOrders?: number;

  @Prop()
  codLevel?: 'trusted' | 'normal' | 'suspect' | 'blocked';
}

export const CustomerSegmentSchema = SchemaFactory.createForClass(CustomerSegment);
