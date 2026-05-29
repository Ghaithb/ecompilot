import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface AfricasTalkingConfig {
  apiKey: string;
  username: string;
  phoneNumber: string; // Votre numéro WhatsApp Business
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class AfricasTalkingProvider {
  private readonly logger = new Logger(AfricasTalkingProvider.name);
  private readonly baseUrl = 'https://api.africastalking.com/version1';
  private config: AfricasTalkingConfig;

  constructor() {
    this.config = {
      apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
      username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox',
      phoneNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '',
    };
  }

  /**
   * Envoyer un message texte WhatsApp
   */
  async sendTextMessage(to: string, message: string): Promise<SendMessageResponse> {
    try {
      const url = `${this.baseUrl}/messaging`;
      
      const response = await axios.post(
        url,
        new URLSearchParams({
          username: this.config.username,
          to: this.formatPhoneNumber(to),
          message: message,
          from: this.config.phoneNumber,
        }),
        {
          headers: {
            'apiKey': this.config.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      const data = response.data;
      
      if (data.SMSMessageData && data.SMSMessageData.Recipients.length > 0) {
        const recipient = data.SMSMessageData.Recipients[0];
        
        if (recipient.status === 'Success') {
          this.logger.log(`Message WhatsApp envoyé à ${to}: ${recipient.messageId}`);
          return {
            success: true,
            messageId: recipient.messageId,
          };
        } else {
          this.logger.warn(`Échec envoi WhatsApp à ${to}: ${recipient.status}`);
          return {
            success: false,
            error: recipient.status,
          };
        }
      }

      return {
        success: false,
        error: 'No recipients in response',
      };
    } catch (error) {
      this.logger.error(`Erreur envoi WhatsApp à ${to}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Envoyer un message template
   * Note: Africa's Talking ne supporte pas nativement les templates WhatsApp
   * On utilise un message texte formaté
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    params: Record<string, string> = {}
  ): Promise<SendMessageResponse> {
    try {
      // Générer le message depuis le template
      const message = this.generateTemplateMessage(templateName, params);
      return await this.sendTextMessage(to, message);
    } catch (error) {
      this.logger.error(`Erreur envoi template WhatsApp:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Générer message depuis template
   */
  private generateTemplateMessage(templateName: string, params: Record<string, string>): string {
    const templates: Record<string, (p: Record<string, string>) => string> = {
      // Template nouvelle commande
      order_confirmation: (p) => `
🎉 *Nouvelle commande #${p.orderNumber}*

👤 Client: ${p.customerName}
💰 Montant: ${p.amount}

Consultez votre tableau de bord pour plus de détails.
${p.link || ''}
      `.trim(),

      // Template paiement confirmé
      payment_confirmed: (p) => `
✅ *Paiement confirmé*

💰 Montant: ${p.amount}
📝 Référence: ${p.reference}
📱 Méthode: ${p.method || 'Mobile Money'}

Merci pour votre confiance!
      `.trim(),

      // Template stock faible
      low_stock_alert: (p) => `
⚠️ *Alerte Stock Faible*

📦 Produit: ${p.productName}
📊 Stock restant: ${p.stock}
🎯 Seuil: ${p.threshold || '5'}

Pensez à réapprovisionner rapidement.
      `.trim(),

      // Template bienvenue
      welcome_message: (p) => `
👋 Bonjour ${p.customerName}!

Bienvenue chez ${p.storeName} 🎉

Nous sommes ravis de vous compter parmi nos clients. N'hésitez pas à nous contacter si vous avez des questions!
      `.trim(),

      // Template panier abandonné
      abandoned_cart: (p) => `
🛒 *Panier oublié?*

Vous avez ${p.itemCount} article(s) qui vous attendent.
💰 Total: ${p.amount}

Finalisez votre commande maintenant:
${p.link}
      `.trim(),

      // Template promotion
      promotion: (p) => `
🎁 *${p.title}*

${p.description}

${p.discount ? `💰 Réduction: ${p.discount}` : ''}
${p.code ? `🏷️ Code: ${p.code}` : ''}

Valable jusqu'au ${p.validUntil}
      `.trim(),
    };

    const templateFn = templates[templateName];
    if (!templateFn) {
      this.logger.warn(`Template inconnu: ${templateName}`);
      return `Message: ${JSON.stringify(params)}`;
    }

    return templateFn(params);
  }

  /**
   * Formater numéro téléphone pour API
   */
  private formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');
    
    // Si commence par 0, enlever le 0 et ajouter code pays par défaut (225 pour CI)
    if (cleaned.startsWith('0')) {
      cleaned = '225' + cleaned.substring(1);
    }
    
    // Ajouter + si absent
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Vérifier configuration
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.username && this.config.phoneNumber);
  }

  /**
   * Obtenir URL widget WhatsApp
   */
  getWhatsAppChatUrl(message?: string): string {
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${this.config.phoneNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  }
}
