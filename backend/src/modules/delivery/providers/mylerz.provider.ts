import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  DeliveryOrderContext,
  DeliveryOrderResult,
  DeliveryProvider,
  DeliveryTrackingResult,
} from '../interfaces/delivery-provider.interface';

/** Mylerz — à contacter pour credentials API Maghreb */
@Injectable()
export class MylerzDeliveryProvider implements DeliveryProvider {
  readonly id = DeliveryProviderId.MYLERZ;
  private readonly logger = new Logger(MylerzDeliveryProvider.name);

  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get('delivery.mylerz.apiKey'));
  }

  async createOrder(ctx: DeliveryOrderContext): Promise<DeliveryOrderResult> {
    if (!this.isConfigured()) {
      this.logger.warn('Mylerz: simulation — MYLERZ_API_KEY manquant');
      return {
        success: true,
        provider: this.id,
        trackingNumber: `MYZ${Date.now().toString().slice(-10)}`,
        providerRef: ctx.orderNumber,
        mock: true,
      };
    }
    return {
      success: true,
      provider: this.id,
      trackingNumber: `MYZ${Date.now().toString().slice(-10)}`,
      providerRef: ctx.orderNumber,
      mock: true,
    };
  }

  async trackOrder(trackingNumber: string): Promise<DeliveryTrackingResult> {
    return {
      provider: this.id,
      trackingNumber,
      status: 'in_transit',
      updatedAt: new Date(),
      history: [{ status: 'in_transit', occurredAt: new Date() }],
      mock: !this.isConfigured(),
    };
  }

  async cancelOrder(): Promise<boolean> {
    return false;
  }
}
