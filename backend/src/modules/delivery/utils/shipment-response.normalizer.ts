import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  NormalizedShipment,
  NormalizedTracking,
} from '../integration/shipment-provider.interface';
import { DeliveryOrderResult, DeliveryTrackingResult } from '../interfaces/delivery-provider.interface';
import { mapProviderWebhookStatus } from '../webhooks/provider-status.mapper';

const TERMINAL = new Set(['delivered', 'cancelled', 'refused', 'return_completed']);

export function normalizeShipmentResult(
  provider: DeliveryProviderId,
  result: DeliveryOrderResult,
): NormalizedShipment {
  return {
    provider,
    trackingNumber: result.trackingNumber,
    providerRef: result.providerRef || result.trackingNumber,
    status: 'created',
    labelUrl: result.labelUrl,
    mock: result.mock,
    rawResponse: result.raw,
  };
}

export function normalizeTrackingResult(
  result: DeliveryTrackingResult,
): NormalizedTracking {
  const status = mapProviderWebhookStatus(result.provider, result.status);
  return {
    provider: result.provider,
    trackingNumber: result.trackingNumber,
    status,
    location: result.location,
    history: (result.history || []).map((e) => ({
      status: mapProviderWebhookStatus(result.provider, e.status),
      location: e.location,
      description: e.description,
      occurredAt: e.occurredAt,
    })),
    rawResponse: result.raw,
  };
}

export function isTerminalStatus(status: string): boolean {
  return TERMINAL.has(status?.toLowerCase());
}

export function toPublicShipment(doc: Record<string, unknown>) {
  return {
    id: doc._id?.toString?.() ?? doc._id,
    _id: doc._id?.toString?.() ?? doc._id,
    tenantId: doc.tenantId,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    provider: doc.provider,
    trackingNumber: doc.trackingNumber,
    providerRef: doc.providerRef,
    status: doc.status,
    labelUrl: doc.labelUrl,
    trackingHistory: doc.trackingHistory,
    lastSyncedAt: doc.lastSyncedAt,
    lastWebhookAt: doc.lastWebhookAt,
    mock: doc.mock,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
