import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  KonnectCredentials,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
} from './payment-gateway.interface';

@Injectable()
export class KonnectProvider {
  private readonly logger = new Logger(KonnectProvider.name);

  private baseUrl(sandbox?: boolean) {
    return sandbox
      ? 'https://api.preprod.konnect.network/api/v2'
      : 'https://api.konnect.network/api/v2';
  }

  async initiatePayment(
    credentials: KonnectCredentials,
    request: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const amountMillimes = Math.round(request.amountTnd * 1000);
    const payload = {
      receiverWalletId: credentials.walletId,
      token: 'TND',
      amount: amountMillimes,
      type: 'immediate',
      description: request.description,
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR', 'flouci'],
      lifespan: 30,
      checkoutForm: true,
      firstName: request.customer.firstName,
      lastName: request.customer.lastName,
      email: request.customer.email,
      phoneNumber: request.customer.phone,
      orderId: request.orderNumber,
      webhook: request.webhookUrl,
      silentWebhook: true,
      successUrl: request.successUrl,
      failUrl: request.failUrl,
      theme: 'light',
    };

    const { data } = await axios.post(`${this.baseUrl(credentials.sandbox)}/payments/init-payment`, payload, {
      headers: {
        'x-api-key': credentials.apiKey,
        'Content-Type': 'application/json',
      },
    });

    const paymentRef = data?.paymentRef || data?.payment?.id;
    const payUrl = data?.payUrl || data?.paymentUrl;

    if (!payUrl || !paymentRef) {
      this.logger.error(`Konnect init failed: ${JSON.stringify(data)}`);
      throw new Error('Réponse Konnect invalide');
    }

    return {
      paymentUrl: payUrl,
      providerReference: paymentRef,
      provider: 'konnect',
    };
  }

  async verifyPayment(
    credentials: KonnectCredentials,
    paymentRef: string,
  ): Promise<PaymentVerifyResponse> {
    const { data } = await axios.get(`${this.baseUrl(credentials.sandbox)}/payments/${paymentRef}`, {
      headers: { 'x-api-key': credentials.apiKey },
    });

    const payment = data?.payment || data;
    const statusRaw = (payment?.status || payment?.payment?.status || '').toLowerCase();

    let status: PaymentVerifyResponse['status'] = 'pending';
    if (['completed', 'paid', 'success'].includes(statusRaw)) status = 'completed';
    if (['failed', 'refused', 'cancelled', 'canceled'].includes(statusRaw)) status = 'failed';

    return {
      status,
      providerReference: paymentRef,
      amount: payment?.amount ? payment.amount / 1000 : undefined,
    };
  }
}
