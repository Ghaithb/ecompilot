import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PageDocument = Page & Document;

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Website' })
  websiteId: Types.ObjectId;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string; // "Accueil", "Produits", "Contact"

  @Prop({ required: true })
  slug: string; // "/", "/products", "/contact"

  @Prop({ type: Object })
  content: any; // JSON du builder (GrapesJS)

  @Prop({ type: String })
  html: string; // HTML généré

  @Prop({ type: String })
  css: string; // CSS généré

  @Prop({ type: Boolean, default: false })
  isHomePage: boolean;

  @Prop({ type: Boolean, default: true })
  published: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Object })
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };

  @Prop({ type: Object })
  settings: {
    showHeader: boolean;
    showFooter: boolean;
    customCss?: string;
    customJs?: string;
  };

  @Prop({ type: Number, default: 0 })
  order: number; // Ordre d'affichage dans le menu

  @Prop({ type: Number, default: 0 })
  views: number; // Nombre de vues

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

// Indexes
PageSchema.index({ websiteId: 1, slug: 1 }, { unique: true });
PageSchema.index({ tenantId: 1 });
PageSchema.index({ published: 1 });
PageSchema.index({ isHomePage: 1 });
