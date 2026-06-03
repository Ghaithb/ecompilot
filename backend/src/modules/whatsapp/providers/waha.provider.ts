import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IWhatsAppProvider, WhatsAppSendResult } from '../interfaces/whatsapp-provider.interface';

@Injectable()
export class WahaProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(WahaProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(config?: any): boolean {
    if (config?.url) return true;
    return !!this.configService.get<string>('messaging.whatsapp.wahaUrl');
  }

  getBusinessNumber(config?: any): string {
    if (config?.businessNumber) return config.businessNumber;
    return this.configService.get<string>('messaging.whatsapp.businessNumber') || '';
  }

  getWhatsAppChatUrl(message?: string, config?: any): string {
    const number = this.getBusinessNumber(config).replace(/\D/g, '');
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return number ? `https://wa.me/${number}${text}` : '';
  }

  async sendTextMessage(to: string, message: string, config?: any): Promise<WhatsAppSendResult> {
    if (!this.isConfigured(config)) {
      this.logger.warn(`[WAHA] Non configuré, message simulé → ${to}`);
      return { success: true, messageId: `sim_waha_${Date.now()}` };
    }

    try {
      const url = config?.url || this.configService.get<string>('messaging.whatsapp.wahaUrl');
      const apiToken = config?.token || config?.tokenEnc || this.configService.get<string>('messaging.whatsapp.wahaToken');

      const response = await axios.post(
        `${url}/api/sendText`,
        {
          chatId: this.formatChatId(to),
          text: message,
          session: config?.session || 'default', // Session par défaut WAHA
        },
        {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        },
      );

      return { success: true, messageId: response.data?.id };
    } catch (error: any) {
      this.logger.error(`Erreur WAHA sendTextMessage: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    params: Record<string, string>,
    config?: any,
  ): Promise<WhatsAppSendResult> {
    // WAHA n'utilise pas de templates officiels au sens Meta.
    // On convertit le template en texte brut pour les pilotes.
    const message = this.buildFallbackText(templateName, params);
    return this.sendTextMessage(to, message, config);
  }

  private formatChatId(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    return clean.includes('@c.us') ? clean : `${clean}@c.us`;
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
}
