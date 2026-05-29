import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  mode: 'TEST' | 'PRODUCTION';
}

export interface CinetPayPaymentData {
  amount: number;
  currency: string;
  transactionId: string;
  description: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notifyUrl: string;
  returnUrl: string;
  channels?: string; // 'ALL', 'MOBILE_MONEY', 'CARD', etc.
  metadata?: Record<string, any>;
}

export interface CinetPayPaymentResponse {
  code: string;
  message: string;
  data: {
    payment_url: string;
    payment_token: string;
  };
}

export interface CinetPayPaymentStatus {
  code: string;
  message: string;
  data: {
    status: 'ACCEPTED' | 'REFUSED' | 'PENDING';
    amount: number;
    currency: string;
    transaction_id: string;
    payment_method: string;
    payment_date?: string;
    operator_id?: string;
  };
}

@Injectable()
export class CinetPayProvider {
  private readonly logger = new Logger(CinetPayProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly siteId: string;

  constructor(config?: CinetPayConfig) {
    this.apiKey = config?.apiKey || process.env.CINETPAY_API_KEY;
    this.siteId = config?.siteId || process.env.CINETPAY_SITE_ID;
    this.baseUrl = config?.mode === 'TEST' 
      ? 'https://api-checkout.cinetpay.com/v2' 
      : 'https://api-checkout.cinetpay.com/v2';

    if (!this.apiKey || !this.siteId) {
      this.logger.warn('CinetPay API key or Site ID not configured');
    }
  }

  /**
   * Crée un paiement Mobile Money
   */
  async createPayment(data: CinetPayPaymentData): Promise<CinetPayPaymentResponse> {
    try {
      this.logger.log(`Creating CinetPay payment for ${data.amount} ${data.currency}`);

      const payload = {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: data.transactionId,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        customer_id: data.customerId,
        customer_name: data.customerName || '',
        customer_surname: '',
        customer_email: data.customerEmail || '',
        customer_phone_number: data.customerPhone || '',
        customer_address: '',
        customer_city: '',
        customer_country: 'CI', // Par défaut Côte d'Ivoire
        customer_state: '',
        customer_zip_code: '',
        notify_url: data.notifyUrl,
        return_url: data.returnUrl,
        channels: data.channels || 'ALL',
        metadata: JSON.stringify(data.metadata || {}),
      };

      const response = await axios.post<CinetPayPaymentResponse>(
        `${this.baseUrl}/payment`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.code !== '201') {
        throw new Error(`CinetPay error: ${response.data.message}`);
      }

      this.logger.log(`Payment created successfully: ${response.data.data.payment_token}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating CinetPay payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async checkPaymentStatus(transactionId: string): Promise<CinetPayPaymentStatus> {
    try {
      this.logger.log(`Checking payment status for transaction: ${transactionId}`);

      const payload = {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: transactionId,
      };

      const response = await axios.post<CinetPayPaymentStatus>(
        `${this.baseUrl}/payment/check`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Payment status: ${response.data.data.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error checking payment status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifie la signature du webhook
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    // CinetPay utilise une clé secrète pour signer les webhooks
    // À implémenter selon la documentation CinetPay
    return true; // Placeholder
  }

  /**
   * Génère un ID de transaction unique
   */
  generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `TX${timestamp}${random}`;
  }

  /**
   * Formate le numéro de téléphone pour CinetPay
   */
  formatPhoneNumber(phone: string, countryCode: string = '225'): string {
    // Enlever tous les caractères non-numériques
    let cleaned = phone.replace(/\D/g, '');
    
    // Ajouter l'indicatif pays si absent
    if (!cleaned.startsWith(countryCode)) {
      // Enlever le 0 initial si présent
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = countryCode + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Liste des providers Mobile Money supportés
   */
  getSupportedProviders() {
    return {
      orangeMoney: {
        name: 'Orange Money',
        countries: ['CI', 'SN', 'ML', 'BF', 'NE', 'CM', 'GN'],
        channel: 'ORANGE_MONEY_CI', // Varie selon le pays
      },
      mtnMoney: {
        name: 'MTN Mobile Money',
        countries: ['CI', 'GH', 'UG', 'RW', 'ZM', 'BJ'],
        channel: 'MTN_CI',
      },
      moovMoney: {
        name: 'Moov Money',
        countries: ['CI', 'BJ', 'TG', 'BF', 'NE'],
        channel: 'MOOV_CI',
      },
      wave: {
        name: 'Wave',
        countries: ['SN', 'CI', 'ML', 'BF', 'TG', 'BJ'],
        channel: 'WAVE',
      },
      flooz: {
        name: 'Flooz (Moov)',
        countries: ['TG', 'BJ'],
        channel: 'FLOOZ',
      },
    };
  }

  /**
   * Obtient la devise par défaut selon le pays
   */
  getCurrencyByCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
      CI: 'XOF', // Côte d'Ivoire
      SN: 'XOF', // Sénégal
      BJ: 'XOF', // Bénin
      TG: 'XOF', // Togo
      ML: 'XOF', // Mali
      BF: 'XOF', // Burkina Faso
      NE: 'XOF', // Niger
      GN: 'XOF', // Guinée
      CM: 'XAF', // Cameroun
      GA: 'XAF', // Gabon
      CG: 'XAF', // Congo
      GH: 'GHS', // Ghana
      NG: 'NGN', // Nigeria
      KE: 'KES', // Kenya
      ZA: 'ZAR', // Afrique du Sud
    };
    
    return currencyMap[countryCode] || 'XOF';
  }
}
