import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContactMessage extends Document {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  subject?: string;

  @Prop({ default: 'unread' })
  status: 'unread' | 'read' | 'replied';

  @Prop({ default: 'website' })
  source: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);

// Index
ContactMessageSchema.index({ tenantId: 1, status: 1 });
ContactMessageSchema.index({ tenantId: 1, createdAt: -1 });
