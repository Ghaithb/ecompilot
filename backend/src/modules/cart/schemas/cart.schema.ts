import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  image?: string;

  @Prop()
  sku?: string;

  @Prop({ type: Object })
  options?: Record<string, unknown>;

  @Prop({ type: Number })
  subtotal: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ _id: false })
export class ShippingQuoteEntry {
  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  rate: number;

  @Prop({ default: 'TND' })
  currency: string;

  @Prop({ default: 2 })
  estimatedDays: number;
}

export const ShippingQuoteEntrySchema = SchemaFactory.createForClass(ShippingQuoteEntry);

@Schema({ _id: false })
export class ScoreHistoryEntry {
  @Prop({ required: true })
  score: number;

  @Prop()
  abandonmentProbability?: number;

  @Prop({ enum: ['low', 'medium', 'high'] })
  urgencyLevel?: string;

  @Prop({ type: Object })
  signals?: Record<string, unknown>;

  @Prop({ default: Date.now })
  recordedAt: Date;
}

export const ScoreHistoryEntrySchema = SchemaFactory.createForClass(ScoreHistoryEntry);

@Schema({ timestamps: true })
export class Cart {
  @Prop()
  userId?: string;

  @Prop({ index: true })
  sessionId?: string;

  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerEmail?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  storeSlug?: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ type: Object })
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };

  @Prop({ default: 'TND' })
  currency: string;

  @Prop({ type: Object })
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode?: string;
    country: string;
    phone?: string;
    governorate?: string;
    delegation?: string;
  };

  @Prop({ type: String })
  couponCode?: string;

  @Prop({ type: Number, default: 0 })
  couponDiscount?: number;

  @Prop({ type: ShippingQuoteEntrySchema })
  selectedShipping?: ShippingQuoteEntry;

  @Prop({ type: [ShippingQuoteEntrySchema], default: [] })
  shippingQuotes?: ShippingQuoteEntry[];

  @Prop()
  estimatedDeliveryAt?: Date;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: Date, default: Date.now, index: true })
  lastActivityAt: Date;

  @Prop()
  abandonedAt?: Date;

  @Prop({ type: Number, default: 0 })
  recoveryRemindersSent: number;

  @Prop()
  lastRecoveryAt?: Date;

  @Prop()
  nextRecoveryAt?: Date;

  @Prop({ type: Number, default: 0 })
  recoveryStage: number;

  @Prop({ type: Number, min: 0, max: 100 })
  conversionScore?: number;

  @Prop({ type: Number, min: 0, max: 1 })
  abandonmentProbability?: number;

  @Prop({ enum: ['low', 'medium', 'high'] })
  urgencyLevel?: string;

  /** @deprecated — use urgencyLevel */
  @Prop({ enum: ['low', 'medium', 'high'] })
  riskLevel?: string;

  @Prop({ type: Number, min: 0, max: 1 })
  conversionProbability?: number;

  @Prop({ enum: ['mobile', 'desktop', 'unknown'], default: 'unknown' })
  deviceType?: string;

  @Prop({ default: 0 })
  checkoutStepReached?: number;

  @Prop({ default: 'cod' })
  paymentMethod?: string;

  @Prop({ type: Number, min: 0, max: 100 })
  deliveryCostSensitivity?: number;

  @Prop({ default: true })
  codPreferred?: boolean;

  @Prop({ type: Number, default: 0 })
  recoveryDiscountPercent?: number;

  @Prop({ type: [ScoreHistoryEntrySchema], default: [] })
  scoreHistory?: ScoreHistoryEntry[];

  @Prop({ type: [String], default: [] })
  frictionFlags?: string[];

  @Prop()
  checkoutStartedAt?: Date;

  @Prop({ default: false })
  recoveredFromAbandonment?: boolean;

  @Prop()
  recoveredAt?: Date;

  /** A/B light */
  @Prop({ enum: ['A', 'B'], default: 'A' })
  checkoutVersion?: string;

  @Prop({ default: 'default' })
  recoveryMessageVariant?: string;

  @Prop({ default: 'category' })
  upsellStrategy?: string;

  @Prop({ type: String, enum: ['active', 'abandoned', 'converted'], default: 'active' })
  status: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CartSchema.index({ userId: 1, tenantId: 1, status: 1 });
CartSchema.index({ sessionId: 1, tenantId: 1, status: 1 });
CartSchema.index({ tenantId: 1, status: 1, lastActivityAt: 1 });
CartSchema.index({ tenantId: 1, status: 1, abandonedAt: -1 });
CartSchema.index({ status: 1, nextRecoveryAt: 1 });
CartSchema.index({ tenantId: 1, riskLevel: 1, status: 1 });
