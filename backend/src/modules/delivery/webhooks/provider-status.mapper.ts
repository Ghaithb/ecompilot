import { DeliveryProviderId } from '../enums/delivery-provider.enum';

const GENERIC_MAP: Record<string, string> = {
  delivered: 'delivered',
  livre: 'delivered',
  livré: 'delivered',
  in_transit: 'in_transit',
  transit: 'in_transit',
  en_cours: 'in_transit',
  out_for_delivery: 'out_for_delivery',
  refused: 'refused',
  retour: 'refused',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  created: 'created',
  pending: 'created',
};

function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

export function mapProviderWebhookStatus(
  provider: DeliveryProviderId,
  raw: string | undefined,
): string {
  if (!raw) return 'updated';
  const key = normalizeKey(raw);

  if (provider === DeliveryProviderId.FIRST_DELIVERY) {
    if (key.includes('livr')) return 'delivered';
    if (key.includes('attente')) return 'created';
    if (key.includes('retour') || key.includes('refus')) return 'refused';
    return GENERIC_MAP[key] || 'in_transit';
  }

  return GENERIC_MAP[key] || key;
}
