import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailSubscriberDocument = EmailSubscriber & Document;

@Schema({ timestamps: true })
export class EmailSubscriber {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: true })
  isSubscribed: boolean;

  @Prop()
  subscribedAt?: Date;

  @Prop()
  unsubscribedAt?: Date;

  @Prop({ type: [String] })
  segments?: string[];

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  stats: {
    emailsSent?: number;
    emailsOpened?: number;
    emailsClicked?: number;
    lastOpenedAt?: Date;
    lastClickedAt?: Date;
  };
}

export const EmailSubscriberSchema = SchemaFactory.createForClass(EmailSubscriber);

EmailSubscriberSchema.index({ tenantId: 1, email: 1 }, { unique: true });
