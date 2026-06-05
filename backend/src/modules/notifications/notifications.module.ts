import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { OtpService } from './otp.service';
import { PushService } from './push.service';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { ResendEmailProvider } from './providers/resend-email.provider';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationService,
    OtpService,
    PushService,
    TwilioSmsProvider,
    ResendEmailProvider,
  ],
  exports: [NotificationsService, NotificationService, OtpService, PushService, TwilioSmsProvider, ResendEmailProvider],
})
export class NotificationsModule {}
