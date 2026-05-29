import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NewsletterSubscriber extends Document {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  name?: string;

  @Prop({ default: 'active' })
  status: 'active' | 'unsubscribed';

  @Prop({ default: 'website' })
  source: string;

  @Prop({ type: Date })
  subscribedAt: Date;

  @Prop({ type: Date })
  unsubscribedAt?: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const NewsletterSubscriberSchema = SchemaFactory.createForClass(NewsletterSubscriber);

// Index unique pour éviter doublons
NewsletterSubscriberSchema.index({ tenantId: 1, email: 1 }, { unique: true });
