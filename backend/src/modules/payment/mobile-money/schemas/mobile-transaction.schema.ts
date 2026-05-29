import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MobileTransactionDocument = MobileTransaction & Document;

export enum MobileMoneyProvider {
  WAVE = 'wave',
  ORANGE_MONEY = 'orange_money',
  MTN_MOBILE_MONEY = 'mtn_mobile_money',
  MOOV_MONEY = 'moov_money',
  AIRTEL_MONEY = 'airtel_money',
}

export enum TransactionStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class MobileTransaction {
  @Prop({ required: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true, enum: MobileMoneyProvider })
  provider: MobileMoneyProvider;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'XOF' })
  currency: string;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop()
  transactionId: string; // ID du provider

  @Prop()
  providerReference: string; // Référence provider

  @Prop()
  qrCode: string; // QR Code pour paiement

  @Prop()
  paymentUrl: string; // URL de paiement

  @Prop({ type: Object })
  metadata: {
    customerName?: string;
    email?: string;
    orderNumber?: string;
    items?: any[];
  };

  @Prop()
  errorMessage: string;

  @Prop()
  errorCode: string;

  @Prop()
  initiatedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ type: Object })
  webhookData: any;
}

export const MobileTransactionSchema = SchemaFactory.createForClass(MobileTransaction);

// Index pour recherches rapides
MobileTransactionSchema.index({ orderId: 1 });
MobileTransactionSchema.index({ transactionId: 1 });
MobileTransactionSchema.index({ tenantId: 1, status: 1 });
MobileTransactionSchema.index({ createdAt: -1 });
