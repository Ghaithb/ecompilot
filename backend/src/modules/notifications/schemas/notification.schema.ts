import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationType = 'stock' | 'payment' | 'subscription' | 'alert' | 'system';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  link?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] })
  priority: string;

  @Prop()
  expiresAt?: Date;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);