export type DeliveryProviderId =
  | 'intigo'
  | 'first_delivery'
  | 'shipper'
  | 'aramex'
  | 'rapid_poste'
  | 'mylerz';

export type DeliveryProviderMeta = {
  id: DeliveryProviderId;
  name: string;
  configured: boolean;
  priority: number;
  supportsPickup?: boolean;
  supportsLocalities?: boolean;
  supportsRates?: boolean;
};

export type DeliveryStats = {
  total: number;
  delivered: number;
  inTransit: number;
  refused: number;
  successRate: number;
};

export type DeliveryOverview = {
  stats: DeliveryStats;
  providers: DeliveryProviderMeta[];
};

export type TrackingEvent = {
  status: string;
  location?: string;
  description?: string;
  occurredAt: string;
};

export type Shipment = {
  id?: string;
  _id: string;
  tenantId: string;
  orderId?: string;
  orderNumber?: string;
  provider: DeliveryProviderId | string;
  trackingNumber: string;
  providerRef?: string;
  labelUrl?: string;
  status: string;
  trackingHistory: TrackingEvent[];
  localityId?: number;
  mock?: boolean;
  lastSyncedAt?: string;
  lastWebhookAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProviderCredential = {
  provider: string;
  isActive: boolean;
  label?: string;
  hasToken: boolean;
  apiUrl?: string | null;
};

export type ConnectionTestResult = {
  ok: boolean;
  provider: string;
  message: string;
};
