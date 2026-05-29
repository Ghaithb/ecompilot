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
  options?: Record<string, any>; // Taille, couleur, etc.

  @Prop({ type: Number })
  subtotal: number; // price * quantity
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true })
  userId: string;

  @Prop()
  sessionId?: string; // Pour les paniers anonymes

  @Prop({ required: true })
  tenantId: string; // Site e-commerce propriétaire

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ type: Object })
  totals: {
    subtotal: number;      // Somme des produits
    tax: number;           // Taxes calculées
    shipping: number;      // Frais de livraison
    discount: number;      // Réductions appliquées
    total: number;         // Total final
  };

  @Prop({ default: 'EUR' })
  currency: string;

  @Prop({ type: Object })
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  @Prop({ type: String })
  couponCode?: string;

  @Prop({ type: Number, default: 0 })
  couponDiscount?: number;

  @Prop({ type: Date })
  expiresAt: Date; // Expiration du panier (7 jours par défaut)

  @Prop({ type: String, enum: ['active', 'abandoned', 'converted'], default: 'active' })
  status: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Index pour nettoyer les paniers expirés
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index composé pour recherche rapide
CartSchema.index({ userId: 1, tenantId: 1 });
CartSchema.index({ sessionId: 1, tenantId: 1 });
