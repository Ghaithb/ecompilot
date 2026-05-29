import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FinancingRequestDocument = FinancingRequest & Document;

@Schema({ timestamps: true })
export class FinancingRequest {
  @Prop({ required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amountRequested: number;

  @Prop({ required: true })
  rbfRate: number;

  @Prop({ required: true })
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'repaid';

  @Prop({ type: Object, default: {} })
  salesHistory: Record<string, any>;

  @Prop({ type: Object, default: {} })
  repayment: {
    totalRepaid: number;
    percentRepaid: number;
    lastRepaymentDate?: Date;
  };
}

export const FinancingRequestSchema = SchemaFactory.createForClass(FinancingRequest);
