import { Injectable, Logger } from '@nestjs/common';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  DeliveryOrderContext,
  DeliveryOrderResult,
  DeliveryProvider,
  DeliveryTrackingResult,
} from '../interfaces/delivery-provider.interface';

/** Rapid Poste / La Poste TN — API limitée ; contacter La Poste pour accès B2B */
@Injectable()
export class RapidPosteDeliveryProvider implements DeliveryProvider {
  readonly id = DeliveryProviderId.RAPID_POSTE;
  private readonly logger = new Logger(RapidPosteDeliveryProvider.name);

  isConfigured(): boolean {
    return false;
  }

  async createOrder(ctx: DeliveryOrderContext): Promise<DeliveryOrderResult> {
    this.logger.warn('Rapid Poste: mode simulation — API publique non disponible');
    return {
      success: true,
      provider: this.id,
      trackingNumber: `RP${Date.now().toString().slice(-10)}`,
      providerRef: ctx.orderNumber,
      mock: true,
    };
  }

  async trackOrder(trackingNumber: string): Promise<DeliveryTrackingResult> {
    return {
      provider: this.id,
      trackingNumber,
      status: 'pending_contract',
      updatedAt: new Date(),
      history: [{ status: 'simulation', description: 'Contacter La Poste Tunisie', occurredAt: new Date() }],
      mock: true,
    };
  }

  async cancelOrder(): Promise<boolean> {
    return false;
  }
}
