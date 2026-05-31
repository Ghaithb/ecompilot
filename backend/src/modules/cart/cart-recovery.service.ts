import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventBusService } from '../../core/events/event-bus.service';
import { DomainEvents } from '../../core/events/domain-events.constants';
import { Cart, CartDocument } from './schemas/cart.schema';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { TwilioSmsProvider } from '../notifications/providers/twilio-sms.provider';
import { normalizeTunisianPhone } from '../../common/utils/phone.util';
import { ConversionIntelligenceService } from '../conversion-intelligence/conversion-intelligence.service';
import {
  RecoveryDecisionEngine,
  RecoveryChannel,
} from '../conversion-intelligence/recovery-decision.engine';
import { RecoveryMessageEngine } from '../conversion-intelligence/recovery-message.engine';

/** Smart recovery V2 — score-based channels, personalization, max 3 steps. */
@Injectable()
export class CartRecoveryService {
  private readonly logger = new Logger(CartRecoveryService.name);

  constructor(
    private config: ConfigService,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private email: EmailService,
    private whatsapp: WhatsAppService,
    private sms: TwilioSmsProvider,
    private intelligence: ConversionIntelligenceService,
    private decision: RecoveryDecisionEngine,
    private messages: RecoveryMessageEngine,
    private events: EventBusService,
  ) {}

  async sendSmartRecovery(cart: CartDocument) {
    const stage = cart.recoveryStage || 0;
    if (stage >= 3) return;

    const intel = this.intelligence.analyzeCart(cart);
    this.intelligence.appendScoreHistory(cart, intel);

    const discountEnabled = await this.decision.getTenantDiscountEnabled(cart.tenantId);
    const maxDiscount = await this.decision.getMaxDiscount(cart.tenantId);
    const plan = this.decision.decide(intel.conversionScore, stage, discountEnabled);

    if (!plan.shouldRecover || !plan.channels.length) {
      cart.nextRecoveryAt = undefined;
      await cart.save();
      return;
    }

    const discountPercent = Math.min(plan.discountPercent, maxDiscount);
    if (discountPercent > 0) {
      cart.recoveryDiscountPercent = discountPercent;
    }

    for (const channel of plan.channels) {
      await this.dispatchChannel(cart, channel, stage, discountPercent);
      this.events.publishSync(DomainEvents.RECOVERY_SENT, {
        tenantId: cart.tenantId,
        cartId: cart._id.toString(),
        channel,
        step: stage + 1,
        variant: cart.recoveryMessageVariant,
        conversionScore: intel.conversionScore,
        urgencyLevel: intel.urgencyLevel,
      });
    }

    cart.recoveryRemindersSent += 1;
    cart.recoveryStage = stage + 1;
    cart.lastRecoveryAt = new Date();
    cart.nextRecoveryAt = plan.delayMinutes
      ? new Date(Date.now() + plan.delayMinutes * 60 * 1000)
      : undefined;
    await cart.save();
  }

  async triggerManualRecovery(tenantId: string, cartId: string) {
    const cart = await this.cartModel.findOne({ _id: cartId, tenantId, status: 'abandoned' });
    if (!cart) throw new NotFoundException('Panier abandonné introuvable');
    await this.sendSmartRecovery(cart);
    return { ok: true, cartId, stage: cart.recoveryStage };
  }

  private async dispatchChannel(
    cart: CartDocument,
    channel: RecoveryChannel,
    stage: number,
    discountPercent: number,
  ) {
    const tenantId = cart.tenantId;
    const name = cart.customerName || 'Client';
    const total = cart.totals?.total || 0;
    const cartUrl = `${this.config.get<string>('cart.recoveryBaseUrl') || 'http://localhost:5173'}/checkout?session=${cart.sessionId || ''}`;
    const msg = this.messages.buildMessage({
      customerName: name,
      total,
      cartUrl,
      variant: cart.recoveryMessageVariant || 'default',
      urgencyLevel: (cart.urgencyLevel || 'medium') as 'low' | 'medium' | 'high',
      stage,
      discountPercent,
      items: (cart.items || []).map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    });

    const email =
      cart.customerEmail ||
      (cart.customerPhone
        ? `${normalizeTunisianPhone(cart.customerPhone).replace('+', '')}@guest.ecompilot.local`
        : undefined);

    if (channel === 'email' && email && !email.endsWith('@guest.ecompilot.local')) {
      await this.email.sendAbandonedCartEmail(email, {
        customerName: name,
        items: cart.items.map((i) => ({ name: i.name, price: i.price, image: i.image })),
        total,
        cartUrl,
      });
      return;
    }

    if (cart.customerPhone) {
      const phone = normalizeTunisianPhone(cart.customerPhone);
      if (channel === 'whatsapp') {
        try {
          await this.whatsapp.sendTextMessage(tenantId, { to: phone, message: msg.body });
        } catch {
          this.logger.debug(`WhatsApp recovery skip ${phone}`);
        }
        return;
      }
      if (channel === 'sms') {
        try {
          await this.sms.sendSms(phone, msg.body);
        } catch {
          this.logger.debug(`SMS recovery skip ${phone}`);
        }
      }
    }
  }
}
