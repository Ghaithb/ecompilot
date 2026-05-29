import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class MetaWhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly apiVersion = 'v21.0';

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return !!(
      this.configService.get<string>('messaging.whatsapp.token') &&
      this.configService.get<string>('messaging.whatsapp.phoneNumberId')
    );
  }

  getBusinessNumber(): string {
    return this.configService.get<string>('messaging.whatsapp.businessNumber') || '';
  }

  getWhatsAppChatUrl(message?: string): string {
    const number = this.getBusinessNumber().replace(/\D/g, '');
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return number ? `https://wa.me/${number}${text}` : '';
  }

  async sendTextMessage(to: string, message: string): Promise<WhatsAppSendResult> {
    if (!this.isConfigured()) {
      this.logger.warn(`[DEV] WhatsApp simulé → ${to}: ${message.slice(0, 80)}...`);
      return { success: true, messageId: `sim_wa_${Date.now()}` };
    }

    try {
      const phoneNumberId = this.configService.get<string>('messaging.whatsapp.phoneNumberId');
      const token = this.configService.get<string>('messaging.whatsapp.token');
      const url = `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}/messages`;

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhoneForMeta(to),
          type: 'text',
          text: { preview_url: false, body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const messageId = response.data?.messages?.[0]?.id;
      this.logger.log(`WhatsApp Meta envoyé à ${to} (${messageId})`);
      return { success: true, messageId };
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(`Erreur Meta WhatsApp → ${to}: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    params: Record<string, string> = {},
  ): Promise<WhatsAppSendResult> {
    const language = this.configService.get<string>('messaging.whatsapp.templateLanguage') || 'fr';

    if (!this.isConfigured()) {
      const fallback = this.buildFallbackText(templateName, params);
      return this.sendTextMessage(to, fallback);
    }

    try {
      const phoneNumberId = this.configService.get<string>('messaging.whatsapp.phoneNumberId');
      const token = this.configService.get<string>('messaging.whatsapp.token');
      const url = `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}/messages`;

      const components = Object.keys(params).length
        ? [{
            type: 'body',
            parameters: Object.values(params).map((value) => ({
              type: 'text',
              text: value,
            })),
          }]
        : undefined;

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneForMeta(to),
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            ...(components ? { components } : {}),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { success: true, messageId: response.data?.messages?.[0]?.id };
    } catch (error: any) {
      this.logger.warn(`Template Meta échoué (${templateName}), fallback texte`);
      return this.sendTextMessage(to, this.buildFallbackText(templateName, params));
    }
  }

  private buildFallbackText(templateName: string, params: Record<string, string>): string {
    const templates: Record<string, (p: Record<string, string>) => string> = {
      order_confirmation: (p) =>
        `Commande #${p.orderNumber} confirmée. Montant: ${p.amount}. Merci ${p.customerName}!`,
      abandoned_cart: (p) =>
        `Votre panier (${p.amount}) vous attend! Code promo: ${p.coupon || 'RECOVERY10'}. ${p.link || ''}`,
      payment_confirmed: (p) => `Paiement confirmé: ${p.amount} (ref: ${p.reference})`,
    };
    const fn = templates[templateName];
    return fn ? fn(params) : `EcomPilot: ${JSON.stringify(params)}`;
  }

  private formatPhoneForMeta(phone: string): string {
    return phone.replace(/\D/g, '');
  }
}
