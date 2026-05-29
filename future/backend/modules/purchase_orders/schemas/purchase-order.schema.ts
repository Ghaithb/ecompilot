import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseOrderDocument = PurchaseOrder & Document;

@Schema({ timestamps: true })
export class PurchaseOrder {
  @Prop({ required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  financingRequestId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: 'pending' | 'ordered' | 'received' | 'cancelled';

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
