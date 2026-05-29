import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WhatsAppMessageDocument = WhatsAppMessage & Document;

@Schema({ timestamps: true })
export class WhatsAppMessage {
  @Prop({ required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  to: string; // Numéro destinataire

  @Prop({ required: true })
  from: string; // Numéro expéditeur (business)

  @Prop({ required: true })
  message: string;

  @Prop({ enum: ['text', 'template', 'image', 'document'], default: 'text' })
  type: string;

  @Prop({ enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' })
  status: string;

  @Prop()
  messageId: string; // ID du provider (WhatsApp)

  @Prop()
  templateName?: string;

  @Prop({ type: Object })
  templateParams?: Record<string, string>;

  @Prop()
  mediaUrl?: string;

  @Prop({ enum: ['outbound', 'inbound'], required: true })
  direction: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  error?: string;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  readAt?: Date;
}

export const WhatsAppMessageSchema = SchemaFactory.createForClass(WhatsAppMessage);

// Indexes
WhatsAppMessageSchema.index({ tenantId: 1, createdAt: -1 });
WhatsAppMessageSchema.index({ to: 1, createdAt: -1 });
WhatsAppMessageSchema.index({ messageId: 1 });
WhatsAppMessageSchema.index({ status: 1 });
