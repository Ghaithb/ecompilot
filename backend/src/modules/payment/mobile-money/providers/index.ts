export { MobileMoneyBaseProvider, PaymentInitiationResult, PaymentVerificationResult } from './base.provider';
export { WaveProvider } from './wave.provider';
export { OrangeMoneyProvider } from './orange-money.provider';

// Providers stub (à implémenter)
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MobileMoneyBaseProvider, PaymentInitiationResult, PaymentVerificationResult } from './base.provider';

@Injectable()
export class MTNMobileMoneyProvider extends MobileMoneyBaseProvider {
  private readonly logger = new Logger(MTNMobileMoneyProvider.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async initiate(data: any): Promise<PaymentInitiationResult> {
    this.logger.warn('MTN Mobile Money - Simulation mode');
    return {
      success: true,
      transactionId: `MTN-${Date.now()}`,
      providerReference: this.generateReference(),
      paymentUrl: `https://payment.mtn.com/mock`,
      expiresAt: this.addExpirationTime(30),
    };
  }

  async verify(transactionId: string): Promise<PaymentVerificationResult> {
    return { success: true, status: 'success', transactionId };
  }

  async refund(transactionId: string, reason: string): Promise<{ success: boolean; errorMessage?: string }> {
    return { success: false, errorMessage: 'Non implémenté' };
  }
}

@Injectable()
export class MoovMoneyProvider extends MobileMoneyBaseProvider {
  private readonly logger = new Logger(MoovMoneyProvider.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async initiate(data: any): Promise<PaymentInitiationResult> {
    this.logger.warn('Moov Money - Simulation mode');
    return {
      success: true,
      transactionId: `MOOV-${Date.now()}`,
      providerReference: this.generateReference(),
      paymentUrl: `https://payment.moov.com/mock`,
      expiresAt: this.addExpirationTime(30),
    };
  }

  async verify(transactionId: string): Promise<PaymentVerificationResult> {
    return { success: true, status: 'success', transactionId };
  }

  async refund(transactionId: string, reason: string): Promise<{ success: boolean; errorMessage?: string }> {
    return { success: false, errorMessage: 'Non implémenté' };
  }
}

@Injectable()
export class AirtelMoneyProvider extends MobileMoneyBaseProvider {
  private readonly logger = new Logger(AirtelMoneyProvider.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async initiate(data: any): Promise<PaymentInitiationResult> {
    this.logger.warn('Airtel Money - Simulation mode');
    return {
      success: true,
      transactionId: `AIRTEL-${Date.now()}`,
      providerReference: this.generateReference(),
      paymentUrl: `https://payment.airtel.com/mock`,
      expiresAt: this.addExpirationTime(30),
    };
  }

  async verify(transactionId: string): Promise<PaymentVerificationResult> {
    return { success: true, status: 'success', transactionId };
  }

  async refund(transactionId: string, reason: string): Promise<{ success: boolean; errorMessage?: string }> {
    return { success: false, errorMessage: 'Non implémenté' };
  }
}
