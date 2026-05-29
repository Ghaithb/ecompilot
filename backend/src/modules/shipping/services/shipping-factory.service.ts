import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SHIPPING_PROVIDER_LABELS,
  SHIPPING_PROVIDER_PRIORITY,
  ShippingProviderId,
} from '../enums/shipping-provider.enum';
import { ShippingProvider } from '../interfaces/shipping-provider.interface';
import { AramexProvider } from '../providers/aramex.provider';
import { FirstDeliveryProvider } from '../providers/first-delivery.provider';
import { IntigoProvider } from '../providers/intigo.provider';

@Injectable()
export class ShippingFactoryService {
  private readonly providers: Map<ShippingProviderId, ShippingProvider>;

  constructor(
    intigo: IntigoProvider,
    firstDelivery: FirstDeliveryProvider,
    aramex: AramexProvider,
  ) {
    this.providers = new Map([
      [ShippingProviderId.INTIGO, intigo],
      [ShippingProviderId.FIRST_DELIVERY, firstDelivery],
      [ShippingProviderId.ARAMEX, aramex],
    ]);
  }

  get(providerId: ShippingProviderId): ShippingProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new BadRequestException(`Transporteur inconnu: ${providerId}`);
    }
    return provider;
  }

  getAll(): ShippingProvider[] {
    return SHIPPING_PROVIDER_PRIORITY.map((id) => this.providers.get(id)!);
  }

  listProvidersMeta() {
    return SHIPPING_PROVIDER_PRIORITY.map((id) => {
      const p = this.get(id);
      return {
        id,
        name: SHIPPING_PROVIDER_LABELS[id],
        configured: p.isConfigured(),
        priority: SHIPPING_PROVIDER_PRIORITY.indexOf(id) + 1,
      };
    });
  }
}
