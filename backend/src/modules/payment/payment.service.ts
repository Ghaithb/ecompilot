import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CinetPayProvider } from './providers/cinetpay.provider';
import { CurrencyService } from '../currency/currency.service';
import { CreateMobileMoneyPaymentDto } from './dto/mobile-money-payment.dto';

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  transactionId: string;
  provider: string;
  amount: number;
  currency: string;
  message?: string;
}

export interface PaymentStatusResult {
  transactionId: string;
  status: 'ACCEPTED' | 'REFUSED' | 'PENDING' | 'UNKNOWN';
  amount: number;
  currency: string;
  paymentMethod?: string;
  paymentDate?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private cinetPayProvider: CinetPayProvider;

  constructor(private readonly currencyService: CurrencyService) {
    this.cinetPayProvider = new CinetPayProvider({
      apiKey: process.env.CINETPAY_API_KEY,
      siteId: process.env.CINETPAY_SITE_ID,
      mode: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
    });
  }

  /**
   * Crée un paiement Mobile Money via CinetPay
   */
  async createMobileMoneyPayment(
    dto: CreateMobileMoneyPaymentDto,
    tenantId: string,
  ): Promise<PaymentResult> {
    try {
      this.logger.log(`Creating Mobile Money payment for tenant: ${tenantId}`);

      // Valider le montant selon la devise
      if (!this.currencyService.validateAmount(dto.amount, dto.currency)) {
        const minAmount = this.currencyService.getMinAmount(dto.currency);
        throw new BadRequestException(
          `Amount must be at least ${this.currencyService.formatAmount(minAmount, dto.currency)}`,
        );
      }

      // Générer un ID de transaction unique
      const transactionId = this.cinetPayProvider.generateTransactionId();

      // Formater le numéro de téléphone
      const countryCode = this.getCountryCodeFromCurrency(dto.currency);
      const formattedPhone = this.cinetPayProvider.formatPhoneNumber(
        dto.phoneNumber,
        countryCode,
      );

      // Créer le paiement
      const payment = await this.cinetPayProvider.createPayment({
        amount: dto.amount,
        currency: dto.currency,
        transactionId,
        description: dto.description,
        customerId: tenantId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: formattedPhone,
        notifyUrl: `${process.env.BACKEND_URL}/api/v1/payment/mobile-money/webhook`,
        returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
        channels: this.mapProviderToChannel(dto.provider),
        metadata: {
          tenantId,
          ...dto.metadata,
        },
      });

      return {
        success: true,
        paymentUrl: payment.data.payment_url,
        transactionId,
        provider: 'cinetpay',
        amount: dto.amount,
        currency: dto.currency,
      };
    } catch (error) {
      this.logger.error(`Error creating Mobile Money payment: ${error.message}`);
      return {
        success: false,
        transactionId: '',
        provider: 'cinetpay',
        amount: dto.amount,
        currency: dto.currency,
        message: error.message,
      };
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    try {
      this.logger.log(`Checking payment status for: ${transactionId}`);

      const status = await this.cinetPayProvider.checkPaymentStatus(transactionId);

      return {
        transactionId,
        status: status.data.status,
        amount: status.data.amount,
        currency: status.data.currency,
        paymentMethod: status.data.payment_method,
        paymentDate: status.data.payment_date,
      };
    } catch (error) {
      this.logger.error(`Error checking payment status: ${error.message}`);
      return {
        transactionId,
        status: 'UNKNOWN',
        amount: 0,
        currency: '',
      };
    }
  }

  /**
   * Traite le webhook de notification de paiement
   */
  async handleWebhook(payload: any, signature?: string): Promise<void> {
    try {
      this.logger.log(`Processing payment webhook: ${payload.transaction_id}`);

      // Vérifier la signature si fournie
      if (signature && !this.cinetPayProvider.verifyWebhookSignature(payload, signature)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // Traiter selon le statut
      switch (payload.status) {
        case 'ACCEPTED':
          await this.handleSuccessfulPayment(payload);
          break;
        case 'REFUSED':
          await this.handleFailedPayment(payload);
          break;
        case 'PENDING':
          this.logger.log(`Payment pending: ${payload.transaction_id}`);
          break;
        default:
          this.logger.warn(`Unknown payment status: ${payload.status}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Traite un paiement réussi
   */
  private async handleSuccessfulPayment(payload: any): Promise<void> {
    this.logger.log(`Payment successful: ${payload.transaction_id}`);
    // TODO: Mettre à jour l'abonnement, envoyer email de confirmation, etc.
    // Cette logique sera ajoutée selon vos besoins
  }

  /**
   * Traite un paiement échoué
   */
  private async handleFailedPayment(payload: any): Promise<void> {
    this.logger.log(`Payment failed: ${payload.transaction_id}`);
    // TODO: Notifier l'utilisateur, logger l'échec, etc.
  }

  /**
   * Mappe le provider vers le channel CinetPay
   */
  private mapProviderToChannel(provider?: string): string {
    const channelMap: Record<string, string> = {
      orange_money: 'ORANGE_MONEY_CI',
      mtn_momo: 'MTN_CI',
      moov_money: 'MOOV_CI',
      airtel_money: 'AIRTEL_CI',
      wave: 'WAVE',
      all: 'ALL',
    };

    return channelMap[provider] || 'ALL';
  }

  /**
   * Obtient le code pays depuis la devise
   */
  private getCountryCodeFromCurrency(currency: string): string {
    const codeMap: Record<string, string> = {
      XOF: '225', // Côte d'Ivoire par défaut
      XAF: '237', // Cameroun
      NGN: '234', // Nigeria
      GHS: '233', // Ghana
      KES: '254', // Kenya
      ZAR: '27',  // Afrique du Sud
    };

    return codeMap[currency] || '225';
  }

  /**
   * Liste les providers disponibles pour un pays
   */
  getAvailableProviders(countryCode: string) {
    return this.cinetPayProvider.getSupportedProviders();
  }
}
