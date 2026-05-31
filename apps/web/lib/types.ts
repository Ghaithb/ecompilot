export type OrderRow = {
  _id?: string;
  id?: string;
  orderNumber: string;
  customerEmail?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  total: number;
  currency?: string;
  createdAt?: string;
  trackingNumber?: string;
};

export type DeliveryOverview = {
  stats?: {
    total?: number;
    delivered?: number;
    inTransit?: number;
    refused?: number;
    successRate?: number;
  };
  providers?: Array<{
    id: string;
    name: string;
    configured: boolean;
    priority?: number;
  }>;
};

export type ShipmentRow = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  provider?: string;
  trackingNumber?: string;
  status?: string;
  createdAt?: string;
};

export type CarrierAnalytics = {
  delivery?: {
    successRate: number;
    deliveredCount: number;
    failedDeliveries: number;
    delayedShipments: number;
    bestCarrier?: { provider: string; successRate: number; avgDays: number } | null;
    worstCarrier?: { provider: string; successRate: number; failed: number } | null;
    insights?: string[];
  };
  regional?: Array<{ region: string; orders: number; revenue: number }>;
  periodDays?: number;
};

export type ProviderCredential = {
  provider: string;
  label?: string;
  configured?: boolean;
  maskedToken?: string;
};

export const PROVIDER_LABELS: Record<string, string> = {
  intigo: 'INTIGO',
  first_delivery: 'First Delivery',
  shipper: 'Shipper',
  aramex: 'Aramex',
  rapid_poste: 'Rapid Poste',
  mylerz: 'Mylerz',
};
