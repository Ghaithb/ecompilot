import { Injectable, Logger } from '@nestjs/common';
import { AramexProvider, CreateShipmentRequest } from './providers/aramex.provider';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private readonly aramexProvider: AramexProvider) {}

  async createShipment(request: CreateShipmentRequest, provider: string = 'aramex') {
    if (provider === 'aramex') {
      return this.aramexProvider.createShipment(request);
    }
    throw new Error(`Provider de livraison non supporté: ${provider}`);
  }

  async trackShipment(trackingNumber: string, provider: string = 'aramex') {
    if (provider === 'aramex') {
      return this.aramexProvider.trackShipment(trackingNumber);
    }
    throw new Error(`Provider de livraison non supporté: ${provider}`);
  }
}
