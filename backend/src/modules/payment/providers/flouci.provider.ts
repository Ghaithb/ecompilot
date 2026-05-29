import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  FlouciCredentials,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
} from './payment-gateway.interface';

@Injectable()
export class FlouciProvider {
  private readonly logger = new Logger(FlouciProvider.name);
  private readonly baseUrl = 'https://developers.flouci.com/api/v2';

  private authHeader(credentials: FlouciCredentials) {
    return `Bearer ${credentials.publicKey}:${credentials.privateKey}`;
  }

  async initiatePayment(
    credentials: FlouciCredentials,
    request: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const amountMillimes = Math.round(request.amountTnd * 1000);
    const payload = {
      amount: String(amountMillimes),
      developer_tracking_id: request.orderId,
      accept_card: true,
      success_link: request.successUrl,
      fail_link: request.failUrl,
      webhook: request.webhookUrl,
      client_id: `${request.customer.firstName || ''} ${request.customer.lastName || ''}`.trim() || request.orderNumber,
    };

    const { data } = await axios.post(`${this.baseUrl}/generate_payment`, payload, {
      headers: {
        Authorization: this.authHeader(credentials),
        'Content-Type': 'application/json',
      },
    });

    const result = data?.result;
    if (!result?.success || !result?.link || !result?.payment_id) {
      this.logger.error(`Flouci init failed: ${JSON.stringify(data)}`);
      throw new Error(result?.message || 'Réponse Flouci invalide');
    }

    return {
      paymentUrl: result.link,
      providerReference: result.payment_id,
      provider: 'flouci',
    };
  }

  async verifyPayment(
    credentials: FlouciCredentials,
    paymentId: string,
  ): Promise<PaymentVerifyResponse> {
    const { data } = await axios.get(`${this.baseUrl}/verify_payment/${paymentId}`, {
      headers: { Authorization: this.authHeader(credentials) },
    });

    const result = data?.result;
    const statusRaw = (result?.status || '').toUpperCase();

    let status: PaymentVerifyResponse['status'] = 'pending';
    if (statusRaw === 'SUCCESS' || statusRaw === 'COMPLETED') status = 'completed';
    if (statusRaw === 'FAILED' || statusRaw === 'FAILURE') status = 'failed';

    return {
      status,
      providerReference: paymentId,
      amount: result?.amount ? Number(result.amount) / 1000 : undefined,
    };
  }
}
