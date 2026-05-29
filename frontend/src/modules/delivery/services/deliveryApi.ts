import { api } from '@/lib/api';
import type {
  ConnectionTestResult,
  DeliveryOverview,
  DeliveryProviderId,
  DeliveryProviderMeta,
  ProviderCredential,
  Shipment,
} from '../types/delivery.types';

export type { DeliveryProviderId } from '../types/delivery.types';

export async function fetchDeliveryOverview(): Promise<DeliveryOverview> {
  const { data } = await api.get('/delivery/overview');
  return data;
}

export async function fetchDeliveryShipments(params?: {
  status?: string;
  provider?: string;
}): Promise<Shipment[]> {
  const { data } = await api.get('/delivery/shipments', { params });
  return data;
}

export async function fetchShipment(shipmentId: string): Promise<Shipment> {
  const { data } = await api.get(`/delivery/shipments/${shipmentId}`);
  return data;
}

export async function fetchDeliveryProviders(): Promise<DeliveryProviderMeta[]> {
  const { data } = await api.get('/delivery/providers');
  return data;
}

export async function fetchProviderCredentials(): Promise<ProviderCredential[]> {
  const { data } = await api.get('/delivery/settings/credentials');
  return data;
}

export async function saveProviderCredential(payload: {
  provider: DeliveryProviderId;
  token: string;
  label?: string;
  apiUrl?: string;
}) {
  const { data } = await api.post('/delivery/settings/credentials', payload);
  return data;
}

export async function testProviderConnection(
  provider: DeliveryProviderId,
): Promise<ConnectionTestResult> {
  const { data } = await api.post(`/delivery/providers/${provider}/test`);
  return data;
}

export async function createShipmentFromOrder(
  orderId: string,
  payload: {
    provider: DeliveryProviderId;
    weightKg?: number;
    localityId?: number;
    async?: boolean;
  },
) {
  const { data } = await api.post(`/delivery/shipments/from-order/${orderId}`, payload);
  return data;
}

export async function syncShipmentTracking(shipmentId: string) {
  const { data } = await api.post(`/delivery/shipments/${shipmentId}/sync`);
  return data;
}

export async function cancelShipment(shipmentId: string) {
  const { data } = await api.post(`/delivery/shipments/${shipmentId}/cancel`);
  return data;
}

export async function compareDeliveryRates(orderId: string) {
  const { data } = await api.post(`/delivery/rates/compare/${orderId}`);
  return data;
}

export async function fetchFirstDeliveryLocalities() {
  const { data } = await api.get('/delivery/localities/first-delivery');
  return data;
}

export const PROVIDER_LABELS: Record<DeliveryProviderId, string> = {
  intigo: 'INTIGO',
  first_delivery: 'First Delivery',
  shipper: 'Shipper',
};

export const PROVIDER_DESCRIPTIONS: Record<DeliveryProviderId, string> = {
  intigo: 'Livraison express Tunisie — API partenaire',
  first_delivery: 'Réseau First Delivery Group — localités & pickups',
  shipper: 'Shipper Network — API Open v1',
};
