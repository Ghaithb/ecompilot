import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MobileMoneyBaseProvider, PaymentInitiationResult, PaymentVerificationResult } from './base.provider';

@Injectable()
export class WaveProvider extends MobileMoneyBaseProvider {
  private readonly logger = new Logger(WaveProvider.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.apiUrl = this.configService.get<string>('WAVE_API_URL') || 'https://api.wave.com/v1';
    this.apiKey = this.configService.get<string>('WAVE_API_KEY') || '';
    this.secretKey = this.configService.get<string>('WAVE_SECRET_KEY') || '';
  }

  async initiate(data: {
    phoneNumber: string;
    amount: number;
    currency: string;
    orderId: string;
    metadata?: any;
  }): Promise<PaymentInitiationResult> {
    try {
      this.logger.log(`Initiating Wave payment for ${data.phoneNumber}, amount: ${data.amount}`);

      const reference = this.generateReference();
      
      // Appel API Wave
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.apiUrl}/checkout/sessions`,
          {
            amount: data.amount,
            currency: data.currency,
            error_url: `${this.configService.get('APP_URL')}/payment/mobile-money/callback/error`,
            success_url: `${this.configService.get('APP_URL')}/payment/mobile-money/callback/success`,
            merchant_reference: reference,
            mobile: data.phoneNumber,
            metadata: {
              order_id: data.orderId,
              ...data.metadata,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response?.data && response.data.id) {
        return {
          success: true,
          transactionId: response.data.id,
          providerReference: reference,
          qrCode: response.data.qr_code,
          paymentUrl: response.data.wave_launch_url,
          expiresAt: this.addExpirationTime(30),
        };
      }

      return {
        success: false,
        errorMessage: 'Réponse invalide de Wave',
        errorCode: 'INVALID_RESPONSE',
      };
    } catch (error) {
      this.logger.error(`Wave initiation error: ${error.message}`, error.stack);
      return {
        success: false,
        errorMessage: error.response?.data?.message || error.message,
        errorCode: error.response?.data?.error || 'PROVIDER_ERROR',
      };
    }
  }

  async verify(transactionId: string): Promise<PaymentVerificationResult> {
    try {
      this.logger.log(`Verifying Wave transaction: ${transactionId}`);

      const response = await firstValueFrom(
        this.httpService.get<any>(`${this.apiUrl}/checkout/sessions/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }),
      );

      if (response?.data) {
        const status = this.mapWaveStatus(response.data.status);
        return {
          success: status === 'success',
          status,
          transactionId: response.data.id,
          amount: response.data.amount,
        };
      }

      return {
        success: false,
        status: 'failed',
        errorMessage: 'Transaction non trouvée',
      };
    } catch (error) {
      this.logger.error(`Wave verification error: ${error.message}`);
      return {
        success: false,
        status: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async refund(transactionId: string, reason: string): Promise<{ success: boolean; errorMessage?: string }> {
    try {
      this.logger.log(`Refunding Wave transaction: ${transactionId}`);

      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.apiUrl}/refunds`,
          {
            checkout_session_id: transactionId,
            reason,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response?.data && response.data.id) {
        return { success: true };
      }

      return { success: false, errorMessage: 'Échec du remboursement' };
    } catch (error) {
      this.logger.error(`Wave refund error: ${error.message}`);
      return {
        success: false,
        errorMessage: error.response?.data?.message || error.message,
      };
    }
  }

  private mapWaveStatus(waveStatus: string): 'pending' | 'success' | 'failed' | 'expired' {
    const statusMap: Record<string, 'pending' | 'success' | 'failed' | 'expired'> = {
      'pending': 'pending',
      'processing': 'pending',
      'success': 'success',
      'completed': 'success',
      'failed': 'failed',
      'cancelled': 'failed',
      'expired': 'expired',
    };

    return statusMap[waveStatus.toLowerCase()] || 'failed';
  }
}
