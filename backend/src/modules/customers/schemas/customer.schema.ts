import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone?: string;

  @Prop()
  company?: string;

  @Prop({ type: Object })
  defaultAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };

  @Prop({ type: [Object], default: [] })
  addresses?: Array<{
    id?: string;
    label?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
    isDefault?: boolean;
  }>;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ default: 'active' })
  status: 'active' | 'inactive' | 'blocked';

  @Prop({ type: Object, default: {} })
  stats: {
    totalOrders?: number;
    totalSpent?: number;
    averageOrderValue?: number;
    lastOrderAt?: Date;
    firstOrderAt?: Date;
  };

  @Prop({ type: Object, default: {} })
  codTrust?: {
    score?: number;
    level?: 'trusted' | 'normal' | 'suspect' | 'blocked';
    deliveryRefusals?: number;
    cancelledOrders?: number;
    verifiedOrders?: number;
    lastOrderAt?: Date;
  };

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  acceptsMarketing: boolean;

  @Prop()
  note?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Index pour optimiser les requêtes
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ tenantId: 1, phone: 1 });
CustomerSchema.index({ tenantId: 1, status: 1 });
CustomerSchema.index({ tenantId: 1, tags: 1 });
CustomerSchema.index({ 'stats.lastOrderAt': -1 });
