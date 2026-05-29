import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MobileMoneyBaseProvider, PaymentInitiationResult, PaymentVerificationResult } from './base.provider';

@Injectable()
export class OrangeMoneyProvider extends MobileMoneyBaseProvider {
  private readonly logger = new Logger(OrangeMoneyProvider.name);
  private readonly apiUrl: string;
  private readonly merchantKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.apiUrl = this.configService.get<string>('ORANGE_MONEY_API_URL') || 'https://api.orange.com/v1';
    this.merchantKey = this.configService.get<string>('ORANGE_MONEY_MERCHANT_KEY') || '';
  }

  async initiate(data: {
    phoneNumber: string;
    amount: number;
    currency: string;
    orderId: string;
    metadata?: any;
  }): Promise<PaymentInitiationResult> {
    try {
      this.logger.log(`Initiating Orange Money payment for ${data.phoneNumber}`);

      const reference = this.generateReference();

      // Simulation pour développement
      // En production, implémenter l'appel réel à l'API Orange Money
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('Orange Money in DEV mode - Simulating payment');
        return {
          success: true,
          transactionId: `OM-${Date.now()}`,
          providerReference: reference,
          paymentUrl: `https://payment.orange.com/mock/${reference}`,
          expiresAt: this.addExpirationTime(30),
        };
      }

      // TODO: Implémenter appel API réel Orange Money
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.apiUrl}/payment`,
          {
            amount: data.amount,
            currency: data.currency,
            phone_number: data.phoneNumber,
            merchant_reference: reference,
            order_id: data.orderId,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.merchantKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        success: true,
        transactionId: response?.data?.transaction_id,
        providerReference: reference,
        paymentUrl: response?.data?.payment_url,
        expiresAt: this.addExpirationTime(30),
      };
    } catch (error) {
      this.logger.error(`Orange Money error: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
        errorCode: 'PROVIDER_ERROR',
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentVerificationResult> {
    try {
      // Simulation DEV
      if (process.env.NODE_ENV !== 'production') {
        return {
          success: true,
          status: 'success',
          transactionId,
        };
      }

      // TODO: Implémenter vérification réelle
      const response = await firstValueFrom(
        this.httpService.get<any>(`${this.apiUrl}/payment/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${this.merchantKey}`,
          },
        }),
      );

      return {
        success: response?.data?.status === 'SUCCESS',
        status: response?.data?.status?.toLowerCase() || 'failed',
        transactionId,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async refund(transactionId: string, reason: string): Promise<{ success: boolean; errorMessage?: string }> {
    this.logger.log(`Refunding Orange Money transaction: ${transactionId}`);
    // TODO: Implémenter remboursement Orange Money
    return { success: false, errorMessage: 'Remboursement non implémenté pour Orange Money' };
  }
}
