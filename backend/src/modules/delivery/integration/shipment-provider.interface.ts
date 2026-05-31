import { DeliveryProviderId } from '../enums/delivery-provider.enum';

/** Payload normalisé — aucune logique logistique, données API uniquement. */
export interface CreateShipmentData {
  orderId: string;
  orderNumber: string;
  tenantId: string;
  recipient: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    province: string;
    country: string;
  };
  parcel: {
    weightKg: number;
    codAmount?: number;
    currency: string;
    total: number;
    lineItems: { title: string; quantity: number; price: number }[];
  };
  localityId?: number;
  notes?: string;
}

export interface PickupRequestData {
  barcodes: string[];
}

export interface NormalizedShipment {
  provider: DeliveryProviderId;
  trackingNumber: string;
  providerRef: string;
  status: string;
  labelUrl?: string;
  mock?: boolean;
  rawResponse?: unknown;
}

export interface NormalizedTrackingEvent {
  status: string;
  location?: string;
  description?: string;
  occurredAt: Date;
}

export interface NormalizedTracking {
  provider: DeliveryProviderId;
  trackingNumber: string;
  status: string;
  location?: string;
  history: NormalizedTrackingEvent[];
  rawResponse?: unknown;
}

export interface NormalizedPickup {
  pickupId: string;
  labelUrl?: string;
  rawResponse?: unknown;
}

/**
 * Contrat d'intégration transporteur (ShipStation-style).
 * EcomPilot n'exécute pas la logistique — appels REST externes uniquement.
 */
export interface DeliveryProviderIntegration {
  readonly providerId: DeliveryProviderId;

  createShipment(tenantId: string, data: CreateShipmentData): Promise<NormalizedShipment>;
  trackShipment(tenantId: string, trackingNumber: string): Promise<NormalizedTracking>;
  cancelShipment(tenantId: string, trackingNumber: string): Promise<boolean>;
  requestPickup(tenantId: string, data: PickupRequestData): Promise<NormalizedPickup>;
}
