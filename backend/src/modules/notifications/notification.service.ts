import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { ResendEmailProvider } from './providers/resend-email.provider';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NotificationData {
  to: string;
  type: 'email' | 'sms';
  template: string;
  data: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly twilioSms: TwilioSmsProvider,
    private readonly resendEmail: ResendEmailProvider,
  ) {}

  async sendEmail(to: string, template: string, data: Record<string, any>): Promise<boolean> {
    try {
      const emailTemplate = this.getEmailTemplate(template, data);
      this.logger.log(`📧 Envoi email → ${to}: ${emailTemplate.subject}`);

      const sent = await this.resendEmail.sendEmail({
        to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      if (!sent && this.emailService) {
        await this.emailService.sendCustomEmail(to, emailTemplate.subject, emailTemplate.html);
        return true;
      }

      return sent;
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${to}: ${error.message}`);
      return false;
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    return this.twilioSms.sendSms(to, message);
  }

  async sendNotification(notification: NotificationData): Promise<boolean> {
    switch (notification.type) {
      case 'email':
        return this.sendEmail(notification.to, notification.template, notification.data);
      case 'sms':
        return this.sendSMS(notification.to, notification.data.message);
      default:
        this.logger.error(`Type de notification non supporté: ${notification.type}`);
        return false;
    }
  }

  // Templates d'emails
  private getEmailTemplate(template: string, data: Record<string, any>): EmailTemplate {
    switch (template) {
      case 'welcome':
        return {
          subject: 'Bienvenue sur EcomPilot!',
          html: `
            <h1>Bienvenue ${data.firstName}!</h1>
            <p>Votre compte EcomPilot a été créé avec succès.</p>
            <p>Vous pouvez maintenant commencer à gérer votre boutique en ligne.</p>
            <p>Bonne chance avec votre business!</p>
          `,
          text: `Bienvenue ${data.firstName}! Votre compte EcomPilot a été créé avec succès.`,
        };

      case 'email_verification':
        return {
          subject: 'Vérifiez votre adresse email',
          html: `
            <h1>Vérification d'email</h1>
            <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email:</p>
            <a href="${data.verificationUrl}">Vérifier mon email</a>
            <p>Ce lien expire dans 1 heure.</p>
          `,
          text: `Vérifiez votre email en cliquant sur: ${data.verificationUrl}`,
        };

      case 'email_verification_code':
        return {
          subject: 'Code de vérification EcomPilot',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Bonjour ${data.firstName} !</h1>
              <p style="font-size: 16px; color: #666;">
                Voici votre code de vérification pour activer les notifications par email :
              </p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <h2 style="color: #000; font-size: 36px; letter-spacing: 8px; margin: 0;">
                  ${data.verificationCode}
                </h2>
              </div>
              <p style="font-size: 14px; color: #999;">
                Ce code expire dans 15 minutes.
              </p>
              <p style="font-size: 14px; color: #999;">
                Si vous n'avez pas demandé ce code, ignorez cet email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} EcomPilot - Tous droits réservés
              </p>
            </div>
          `,
          text: `Bonjour ${data.firstName}!\n\nVotre code de vérification : ${data.verificationCode}\n\nCe code expire dans 15 minutes.\n\nSi vous n'avez pas demandé ce code, ignorez cet email.`,
        };

      case 'password_reset':
        return {
          subject: 'Réinitialisation de votre mot de passe',
          html: `
            <h1>Réinitialisation de mot de passe</h1>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
            <a href="${data.resetUrl}">Réinitialiser mon mot de passe</a>
            <p>Ce lien expire dans 30 minutes.</p>
          `,
          text: `Réinitialisez votre mot de passe: ${data.resetUrl}`,
        };

      case 'order_confirmation':
        return {
          subject: `Confirmation de commande ${data.orderNumber}`,
          html: `
            <h1>Commande confirmée!</h1>
            <p>Votre commande ${data.orderNumber} a été confirmée.</p>
            <p>Total: ${data.total} ${data.currency}</p>
            <p>Nous traiterons votre commande dans les plus brefs délais.</p>
          `,
          text: `Commande ${data.orderNumber} confirmée. Total: ${data.total} ${data.currency}`,
        };

      case 'order_shipped':
        return {
          subject: `Votre commande ${data.orderNumber} a été expédiée`,
          html: `
            <h1>Commande expédiée!</h1>
            <p>Votre commande ${data.orderNumber} a été expédiée.</p>
            ${data.trackingNumber ? `<p>Numéro de suivi: ${data.trackingNumber}</p>` : ''}
            <p>Merci pour votre achat!</p>
          `,
          text: `Commande ${data.orderNumber} expédiée.${data.trackingNumber ? ` Suivi: ${data.trackingNumber}` : ''}`,
        };

      case 'low_stock_alert':
        return {
          subject: 'Alerte stock bas',
          html: `
            <h1>Stock bas détecté</h1>
            <p>Les produits suivants ont un stock faible:</p>
            <ul>
              ${data.products.map((p: any) => `<li>${p.title} (${p.variantName}): ${p.currentStock} en stock</li>`).join('')}
            </ul>
            <p>Pensez au réapprovisionnement.</p>
          `,
          text: `Stock bas pour: ${data.products.map((p: any) => `${p.title} (${p.currentStock})`).join(', ')}`,
        };

      case 'subscription_expiring':
        return {
          subject: 'Votre abonnement expire bientôt',
          html: `
            <h1>Abonnement expirant</h1>
            <p>Votre abonnement ${data.planName} expire le ${data.expiryDate}.</p>
            <p>Renouvelez maintenant pour continuer à profiter de tous les services.</p>
            <a href="${data.renewalUrl}">Renouveler mon abonnement</a>
          `,
          text: `Abonnement ${data.planName} expire le ${data.expiryDate}. Renouveler: ${data.renewalUrl}`,
        };

      case 'payment_failed':
        return {
          subject: 'Échec de paiement',
          html: `
            <h1>Paiement échoué</h1>
            <p>Le paiement de votre abonnement ${data.planName} a échoué.</p>
            <p>Veuillez mettre à jour vos informations de paiement.</p>
            <a href="${data.paymentUrl}">Mettre à jour le paiement</a>
          `,
          text: `Paiement échoué pour ${data.planName}. Mettre à jour: ${data.paymentUrl}`,
        };

      case 'abandoned_cart':
        return {
          subject: '🛒 Votre panier vous attend — offre spéciale',
          html: `
            <h1>Bonjour ${data.name || ''},</h1>
            <p>Vous avez laissé des articles dans votre panier (${data.total} DT).</p>
            <p>Utilisez le code <strong>${data.coupon || 'RECOVERY10'}</strong> pour -10%.</p>
            <p><a href="${data.link || '#'}">Finaliser ma commande</a></p>
          `,
          text: `Panier abandonné: ${data.total} DT. Code: ${data.coupon || 'RECOVERY10'}`,
        };

      default:
        return {
          subject: 'Notification EcomPilot',
          html: '<p>Notification du système EcomPilot.</p>',
          text: 'Notification du système EcomPilot.',
        };
    }
  }

  // Méthodes utilitaires pour envoyer des notifications spécifiques
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendEmail(email, 'welcome', { firstName });
  }

  async sendEmailVerification(email: string, verificationUrl: string): Promise<boolean> {
    return this.sendEmail(email, 'email_verification', { verificationUrl });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail(email, 'password_reset', { resetUrl });
  }

  async sendOrderConfirmation(email: string, orderData: any): Promise<boolean> {
    return this.sendEmail(email, 'order_confirmation', orderData);
  }

  async sendOrderShipped(email: string, orderData: any): Promise<boolean> {
    return this.sendEmail(email, 'order_shipped', orderData);
  }

  async sendLowStockAlert(email: string, products: any[]): Promise<boolean> {
    return this.sendEmail(email, 'low_stock_alert', { products });
  }

  async sendSubscriptionExpiring(email: string, subscriptionData: any): Promise<boolean> {
    return this.sendEmail(email, 'subscription_expiring', subscriptionData);
  }

  async sendPaymentFailed(email: string, paymentData: any): Promise<boolean> {
    return this.sendEmail(email, 'payment_failed', paymentData);
  }

  async sendEmailVerificationCode(email: string, firstName: string, verificationCode: string): Promise<boolean> {
    return this.sendEmail(email, 'email_verification_code', { firstName, verificationCode });
  }
}




