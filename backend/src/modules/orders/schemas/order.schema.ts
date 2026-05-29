import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderLineItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  variantId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  total: number;
}

@Schema()
export class ShippingAddress {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  address1: string;

  @Prop()
  address2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  zip: string;

  @Prop()
  phone: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ type: [OrderLineItem], required: true })
  lineItems: OrderLineItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  shippingAmount: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: 'created' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedDriverId?: Types.ObjectId;

  @Prop()
  delegation?: string;

  @Prop()
  amountToCollect?: number;

  @Prop()
  refusalReason?: string;

  @Prop()
  returnReason?: string;

  @Prop()
  deliveryProofUrl?: string;

  @Prop({ type: Object })
  returnDetails?: {
    reason?: string;
    photos?: string[];
    notes?: string;
    processedAt?: Date;
    processedBy?: string;
  };

  @Prop({ type: [{
    status: String,
    changedAt: Date,
    changedBy: String,
  }], default: [] })
  statusHistory: Array<{ status: string; changedAt: Date; changedBy: string }>;

  @Prop({ default: 'pending' })
  paymentStatus: string; // pending, paid, refunded, failed

  @Prop({ default: 'stripe' })
  paymentMethod: string; // stripe, cod, bank_transfer, paymee, konnekt

  @Prop({ default: false })
  isVerified: boolean; // Pour la validation SMS (OTP)

  @Prop({ type: ShippingAddress })
  shippingAddress: ShippingAddress;

  @Prop({ type: ShippingAddress })
  billingAddress: ShippingAddress;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Object, default: null })
  paymentDetails?: {
    provider: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date;
  };

  @Prop()
  fulfillmentStatus: string;

  @Prop()
  trackingNumber: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Index pour optimiser les requêtes
OrderSchema.index({ tenantId: 1, status: 1 });
OrderSchema.index({ tenantId: 1, customerEmail: 1 });
OrderSchema.index({ tenantId: 1, createdAt: -1 });
// Index unique sur orderNumber déjà défini via @Prop({ unique: true })
