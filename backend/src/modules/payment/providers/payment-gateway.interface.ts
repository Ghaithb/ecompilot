export interface PaymentInitRequest {
  amountTnd: number;
  orderId: string;
  orderNumber: string;
  description: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  webhookUrl: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  providerReference: string;
  provider: 'konnect' | 'flouci';
}

export interface PaymentVerifyResponse {
  status: 'completed' | 'pending' | 'failed';
  providerReference: string;
  amount?: number;
}

export interface KonnectCredentials {
  apiKey: string;
  walletId: string;
  sandbox?: boolean;
}

export interface FlouciCredentials {
  publicKey: string;
  privateKey: string;
  sandbox?: boolean;
}
