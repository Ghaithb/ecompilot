export interface PaymentInitiationResult {
  success: boolean;
  transactionId?: string;
  providerReference?: string;
  qrCode?: string;
  paymentUrl?: string;
  expiresAt?: Date;
  errorMessage?: string;
  errorCode?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'expired';
  transactionId?: string;
  amount?: number;
  errorMessage?: string;
}

export abstract class MobileMoneyBaseProvider {
  abstract initiate(data: {
    phoneNumber: string;
    amount: number;
    currency: string;
    orderId: string;
    metadata?: any;
  }): Promise<PaymentInitiationResult>;

  abstract verify(transactionId: string): Promise<PaymentVerificationResult>;

  abstract refund(transactionId: string, reason: string): Promise<{ success: boolean; errorMessage?: string }>;

  protected generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
  }

  protected addExpirationTime(minutes: number = 30): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
