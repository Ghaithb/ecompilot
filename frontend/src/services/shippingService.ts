import { api } from '@/lib/api';

export type ShippingProviderId = 'intigo' | 'first_delivery' | 'aramex';

export type ProviderMeta = {
  id: ShippingProviderId;
  name: string;
  configured: boolean;
  priority: number;
};

export type ShippingRate = {
  provider: ShippingProviderId;
  rate: number;
  currency: string;
  estimatedDays: number;
  mock?: boolean;
};

export async function fetchShippingProviders() {
  const { data } = await api.get<ProviderMeta[]>('/shipping/providers');
  return data;
}

export async function compareShippingRates(payload: {
  orderId?: string;
  weightKg?: number;
}) {
  const { data } = await api.post<{ rates: ShippingRate[] }>('/shipping/rates/compare', payload);
  return data.rates;
}

export async function createShipmentFromOrder(
  orderId: string,
  provider: ShippingProviderId,
  options?: { weightKg?: number; localityId?: number; notes?: string },
) {
  const { data } = await api.post(`/shipping/shipments/from-order/${orderId}`, {
    provider,
    ...options,
  });
  return data;
}

export async function trackShipment(provider: ShippingProviderId, trackingNumber: string) {
  const { data } = await api.get(`/shipping/track/${provider}/${trackingNumber}`);
  return data;
}

export async function fetchFirstDeliveryLocalities() {
  const { data } = await api.get('/shipping/first-delivery/localities');
  return data;
}
