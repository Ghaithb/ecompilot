import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class ProductVariant {
  _id?: Types.ObjectId;
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  compareAtPrice: number;

  @Prop({ default: 0 })
  cost: number;

  @Prop({ default: 0 })
  inventory: number;

  @Prop({ type: Object, default: {} })
  attributes: Record<string, string>; // couleur, taille, etc.

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  images: string[];

  // External mappings for integrations
  @Prop()
  shopifyVariantId?: number;

  @Prop()
  shopifyInventoryItemId?: number;
}

@Schema({ timestamps: true })
export class Product {
  // Mongoose Document compatibility stub
  save?: () => Promise<this>;
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  handle: string; // URL slug

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: [ProductVariant], default: [] })
  variants: ProductVariant[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  category: string;

  @Prop()
  vendor: string;

  @Prop({ default: 'draft' })
  status: string; // draft, active, archived

  @Prop({ type: Object, default: {} })
  seo: {
    title?: string;
    description?: string;
  };

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Index pour optimiser les requêtes
ProductSchema.index({ tenantId: 1, status: 1 });
ProductSchema.index({ tenantId: 1, handle: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, tags: 1 });
ProductSchema.index({ tenantId: 1, category: 1 });

