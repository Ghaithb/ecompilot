import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailTemplateDocument = EmailTemplate & Document;

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  htmlContent: string;

  @Prop()
  textContent?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  variables?: Record<string, string>; // {productName}, {customerName}, etc.
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);

// Index pour recherche rapide
EmailTemplateSchema.index({ tenantId: 1 });
