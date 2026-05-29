import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AbandonedCart, AbandonedCartDocument } from '../abandoned-cart/schemas/abandoned-cart.schema';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { NotificationService } from '../notifications/notification.service';

enum ContactChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
}

@Injectable()
export class MultiChannelOrchestratorService {
  private readonly logger = new Logger(MultiChannelOrchestratorService.name);

  constructor(
    @InjectModel(AbandonedCart.name) private abandonedCartModel: Model<AbandonedCartDocument>,
    private readonly whatsAppService: WhatsAppService,
    private readonly notificationService: NotificationService,
  ) {}

  async startRecoverySequence(tenantId: string, abandonedCartId: string): Promise<void> {
    const cart = await this.abandonedCartModel.findById(abandonedCartId);
    if (!cart || cart.recovered) return;

    await this.sendWhatsAppReminder(tenantId, abandonedCartId);
  }

  async sendWhatsAppReminder(tenantId: string, abandonedCartId: string): Promise<void> {
    const cart = await this.abandonedCartModel.findById(abandonedCartId);
    if (!cart || cart.recovered) return;

    const phone = cart.customerPhone;
    if (!phone) {
      this.logger.warn(`Pas de téléphone pour panier ${abandonedCartId}`);
      return;
    }

    try {
      const coupon = cart.recoveryCouponCode || (await this.ensureRecoveryCoupon(tenantId, cart));
      const slug = cart.storeSlug || '';
      const message = `Bonjour ${cart.customerName || ''} 👋\n\nVous avez laissé ${cart.items.length} article(s) (${cart.totalAmount} DT).\n\nFinalisez votre commande avec -10% : ${coupon}\n\n🔗 ${slug ? `/store/${slug}` : 'Votre boutique'}`;

      const result = await this.whatsAppService.sendTextMessage(tenantId, { to: phone, message });

      cart.remindersSent = (cart.remindersSent ?? 0) + 1;
      cart.reminderDates = [...(cart.reminderDates ?? []), new Date()];
      cart.recoveryCouponCode = coupon;
      cart.channelAttempts = [...(cart.channelAttempts ?? []), {
        channel: ContactChannel.WHATSAPP,
        attemptedAt: new Date(),
        success: result.success,
        errorMessage: result.error,
      }];
      cart.reminderStage = 1;
      cart.nextReminderAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await cart.save();
    } catch (error) {
      this.logger.error(`WhatsApp recovery failed for ${abandonedCartId}`, error);
    }
  }

  private async sendSmsReminder(cart: AbandonedCartDocument): Promise<void> {
    if (!cart.customerPhone) return;
    const coupon = cart.recoveryCouponCode || 'RECOVERY10';
    const message = `EcomPilot: Votre panier (${cart.totalAmount} DT) vous attend. Code -10%: ${coupon}`;
    const sent = await this.notificationService.sendSMS(cart.customerPhone, message);

    cart.channelAttempts = [...(cart.channelAttempts ?? []), {
      channel: ContactChannel.SMS,
      attemptedAt: new Date(),
      success: sent,
    }];
    cart.remindersSent = (cart.remindersSent ?? 0) + 1;
    cart.reminderStage = 2;
    cart.nextReminderAt = new Date(Date.now() + 22 * 60 * 60 * 1000);
    await cart.save();
  }

  private async sendEmailCouponReminder(cart: AbandonedCartDocument): Promise<void> {
    if (!cart.customerEmail || cart.customerEmail.includes('@guest.ecompilot.local')) return;
    const coupon = cart.recoveryCouponCode || (await this.ensureRecoveryCoupon(cart.tenantId.toString(), cart));

    await this.notificationService.sendEmail(cart.customerEmail, 'abandoned_cart', {
      name: cart.customerName,
      coupon,
      total: cart.totalAmount,
    });

    cart.channelAttempts = [...(cart.channelAttempts ?? []), {
      channel: ContactChannel.EMAIL,
      attemptedAt: new Date(),
      success: true,
    }];
    cart.remindersSent = (cart.remindersSent ?? 0) + 1;
    cart.reminderStage = 3;
    await cart.save();
  }

  async markCartRecovered(abandonedCartId: string, channel: ContactChannel): Promise<void> {
    const cart = await this.abandonedCartModel.findById(abandonedCartId);
    if (!cart) return;
    cart.recovered = true;
    cart.recoveredAt = new Date();
    cart.recoveryChannel = channel;
    await cart.save();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async processAbandonedCartsSchedule(): Promise<void> {
    const carts = await this.abandonedCartModel.find({ recovered: false }).exec();

    for (const cart of carts) {
      const createdAt = (cart as any).createdAt as Date;
      const minutesSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
      const stage = cart.reminderStage ?? 0;

      if (minutesSince >= 15 && stage < 1 && !this.hasChannelAttempt(cart, ContactChannel.WHATSAPP)) {
        await this.sendWhatsAppReminder(cart.tenantId.toString(), cart._id.toString());
      } else if (minutesSince >= 120 && stage < 2 && !this.hasChannelAttempt(cart, ContactChannel.SMS)) {
        await this.sendSmsReminder(cart);
      } else if (minutesSince >= 1440 && stage < 3 && !this.hasChannelAttempt(cart, ContactChannel.EMAIL)) {
        await this.sendEmailCouponReminder(cart);
      }
    }
  }

  private hasChannelAttempt(cart: AbandonedCartDocument, channel: ContactChannel): boolean {
    return (cart.channelAttempts ?? []).some((a) => a.channel === channel);
  }

  private async ensureRecoveryCoupon(tenantId: string, cart: AbandonedCartDocument): Promise<string> {
    const code = `REC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    cart.recoveryCouponCode = code;
    await cart.save();
    return code;
  }

  async getRecoveryStats(tenantId: string) {
    const carts = await this.abandonedCartModel.find({
      tenantId: new Types.ObjectId(tenantId),
    }).exec();

    const totalAbandoned = carts.length;
    const recovered = carts.filter((c) => c.recovered);
    const byChannel: Record<string, number> = { whatsapp: 0, sms: 0, email: 0 };

    recovered.forEach((cart) => {
      const channel = cart.recoveryChannel || 'unknown';
      byChannel[channel] = (byChannel[channel] || 0) + 1;
    });

    return {
      totalAbandoned,
      totalRecovered: recovered.length,
      recoveryRate: totalAbandoned > 0 ? (recovered.length / totalAbandoned) * 100 : 0,
      byChannel,
      averageTimeToRecover: 0,
    };
  }
}
