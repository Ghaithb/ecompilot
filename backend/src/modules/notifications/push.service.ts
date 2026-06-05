import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webpush from 'web-push';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AppRole } from '../../common/enums/app-role.enum';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');

    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:support@ecompilot.tn',
        publicKey,
        privateKey,
      );
      this.logger.log('Web Push VAPID details set successfully');
    } else {
      this.logger.warn('Web Push VAPID keys not configured');
    }
  }

  async sendPushNotification(tenantId: string | null, payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
  }) {
    // If tenantId is provided, notify all admins/merchants of that tenant
    if (tenantId) {
      const users = await this.userModel.find({
        tenantId,
        roles: { $in: [AppRole.ADMIN, AppRole.MERCHANT] },
        'pushSubscription.endpoint': { $exists: true },
      });

      for (const user of users) {
        if (user.pushSubscription) {
          await this.sendRawNotification(user.pushSubscription, payload);
        }
      }
      return { success: true, notifiedCount: users.length };
    }
  }

  async saveSubscription(userId: string, subscription: any) {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { pushSubscription: subscription },
    });
  }

  private async sendRawNotification(subscription: any, payload: any) {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          ...payload,
          icon: payload.icon || '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        }),
      );
    } catch (error) {
      this.logger.error(`Error sending push notification to endpoint ${subscription.endpoint}:`, error);
      // Optional: Cleanup expired subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        await this.userModel.updateOne(
          { 'pushSubscription.endpoint': subscription.endpoint },
          { $unset: { pushSubscription: 1 } },
        );
      }
    }
  }
}
