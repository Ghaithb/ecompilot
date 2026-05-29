import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true })
  discountValue: number; // Pourcentage ou montant fixe

  @Prop({ type: Date })
  validFrom?: Date;

  @Prop({ type: Date })
  validUntil?: Date;

  @Prop({ default: 0 })
  minPurchaseAmount?: number; // Montant minimum d'achat

  @Prop({ default: null })
  maxDiscountAmount?: number; // Montant maximum de réduction (pour %)

  @Prop({ default: null })
  usageLimit?: number; // Nombre total d'utilisations autorisées

  @Prop({ default: 0 })
  usedCount: number; // Nombre de fois utilisé

  @Prop({ default: 1 })
  usageLimitPerCustomer?: number; // Limite par client

  @Prop({ type: [String], default: [] })
  applicableProducts?: string[]; // IDs des produits concernés (vide = tous)

  @Prop({ type: [String], default: [] })
  applicableCategories?: string[]; // Catégories concernées

  @Prop({ default: 'active' })
  status: 'active' | 'inactive' | 'expired';

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ type: [Object], default: [] })
  usageHistory: Array<{
    customerId?: string;
    customerEmail: string;
    orderId: string;
    discountAmount: number;
    usedAt: Date;
  }>;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// Index pour optimiser les requêtes
CouponSchema.index({ tenantId: 1, code: 1 }, { unique: true });
CouponSchema.index({ tenantId: 1, status: 1 });
CouponSchema.index({ validFrom: 1, validUntil: 1 });
