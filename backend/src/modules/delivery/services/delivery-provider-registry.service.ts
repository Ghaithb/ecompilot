import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DELIVERY_PROVIDER_LABELS,
  DeliveryProviderId,
  MVP_DELIVERY_PROVIDERS,
} from '../enums/delivery-provider.enum';
import { DeliveryProvider } from '../interfaces/delivery-provider.interface';
import { FirstDeliveryProvider } from '../providers/first-delivery.provider';
import { IntigoProvider } from '../providers/intigo.provider';
import { ShipperProvider } from '../providers/shipper.provider';

/**
 * Registry des transporteurs actifs (MVP : INTIGO, First Delivery, Shipper).
 */
@Injectable()
export class DeliveryProviderRegistry {
  private readonly providers = new Map<DeliveryProviderId, DeliveryProvider>();

  constructor(
    intigo: IntigoProvider,
    firstDelivery: FirstDeliveryProvider,
    shipper: ShipperProvider,
  ) {
    this.register(intigo);
    this.register(firstDelivery);
    this.register(shipper);
  }

  private register(provider: DeliveryProvider) {
    this.providers.set(provider.id, provider);
  }

  get(providerId: DeliveryProviderId): DeliveryProvider {
    const p = this.providers.get(providerId);
    if (!p) {
      throw new BadRequestException(
        `Transporteur non supporté: ${providerId}. Actifs: ${MVP_DELIVERY_PROVIDERS.join(', ')}`,
      );
    }
    return p;
  }

  getFirstDelivery(): FirstDeliveryProvider {
    return this.get(DeliveryProviderId.FIRST_DELIVERY) as unknown as FirstDeliveryProvider;
  }

  async listMeta(tenantId?: string) {
    return Promise.all(
      MVP_DELIVERY_PROVIDERS.map(async (id, index) => {
        const p = this.get(id);
        const configured = await p.isConfigured(tenantId);
        return {
          id,
          name: DELIVERY_PROVIDER_LABELS[id],
          configured,
          priority: index + 1,
          supportsPickup: id === DeliveryProviderId.FIRST_DELIVERY,
          supportsLocalities: Boolean(p.getLocalities),
          supportsRates: Boolean(p.getRates),
        };
      }),
    );
  }
}
