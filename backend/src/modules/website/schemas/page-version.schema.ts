import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PageVersionDocument = PageVersion & Document;

@Schema({ timestamps: true })
export class PageVersion {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Page' })
  pageId: Types.ObjectId;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  version: number; // Version numéro

  @Prop({ type: String })
  label: string; // Label optionnel (ex: "Version finale", "Avant refonte")

  @Prop({ type: Object })
  content: any; // JSON du builder (GrapesJS)

  @Prop({ type: String })
  html: string; // HTML généré

  @Prop({ type: String })
  css: string; // CSS généré

  @Prop({ type: String })
  createdBy: string; // User ID qui a créé cette version

  @Prop({ type: String })
  comment: string; // Commentaire de modification

  @Prop({ type: Boolean, default: false })
  isAutoSave: boolean; // Auto-sauvegarde ou sauvegarde manuelle

  @Prop({ type: Date })
  createdAt: Date;
}

export const PageVersionSchema = SchemaFactory.createForClass(PageVersion);

// Indexes
PageVersionSchema.index({ pageId: 1, version: -1 });
PageVersionSchema.index({ tenantId: 1, createdAt: -1 });
PageVersionSchema.index({ pageId: 1, isAutoSave: 1 });
