import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envoyer email de confirmation de commande
   */
  async sendOrderConfirmation(
    email: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      total: number;
      shippingAddress: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`📧 Envoi confirmation commande à: ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: `✅ Confirmation de commande #${orderData.orderNumber}`,
        template: './order-confirmation',
        context: {
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          items: orderData.items,
          total: orderData.total.toFixed(2),
          shippingAddress: orderData.shippingAddress,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`✅ Email envoyé avec succès à: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Envoyer email de confirmation de paiement
   */
  async sendPaymentConfirmation(
    email: string,
    paymentData: {
      orderNumber: string;
      amount: number;
      paymentMethod: string;
      customerName: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`💳 Envoi confirmation paiement à: ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: `💳 Paiement confirmé - Commande #${paymentData.orderNumber}`,
        template: './payment-confirmation',
        context: {
          ...paymentData,
          amount: paymentData.amount.toFixed(2),
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`✅ Email paiement envoyé à: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email paiement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envoyer email de mise à jour d'expédition
   */
  async sendShippingUpdate(
    email: string,
    shippingData: {
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
      customerName: string;
      estimatedDelivery?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`📦 Envoi mise à jour expédition à: ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: `📦 Votre commande #${shippingData.orderNumber} a été expédiée`,
        template: './shipping-update',
        context: {
          ...shippingData,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`✅ Email expédition envoyé à: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email expédition: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envoyer email de bienvenue
   */
  async sendWelcomeEmail(
    email: string,
    userData: {
      name: string;
      companyName?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`👋 Envoi email de bienvenue à: ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: `🎉 Bienvenue sur ${userData.companyName || 'notre site'} !`,
        template: './welcome',
        context: {
          ...userData,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`✅ Email bienvenue envoyé à: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email bienvenue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envoyer email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(
    email: string,
    resetData: {
      name: string;
      resetToken: string;
      resetUrl: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`🔐 Envoi email reset password à: ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe',
        template: './password-reset',
        context: {
          ...resetData,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`✅ Email reset envoyé à: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email reset: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envoyer email panier abandonné
   */
  async sendAbandonedCartEmail(
    email: string,
    cartData: {
      customerName: string;
      items: Array<{
        name: string;
        price: number;
        image?: string;
      }>;
      total: number;
      cartUrl: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`🛒 Envoi email panier abandonné à: ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: '🛒 Vous avez oublié quelque chose dans votre panier',
        template: './abandoned-cart',
        context: {
          ...cartData,
          total: cartData.total.toFixed(2),
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`✅ Email panier abandonné envoyé à: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email panier abandonné: ${error.message}`);
    }
  }

  /**
   * Envoyer email personnalisé
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      this.logger.log(`📨 Envoi email personnalisé à: ${to}`);

      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });

      this.logger.log(`✅ Email personnalisé envoyé à: ${to}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email personnalisé: ${error.message}`);
      throw error;
    }
  }
}
