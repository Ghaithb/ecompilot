import { DeliveryProviderId } from '../enums/delivery-provider.enum';

export interface DeliveryOrderContext {
  orderId: string;
  orderNumber: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city: string;
  province: string;
  country: string;
  weightKg: number;
  codAmount?: number;
  currency: string;
  total: number;
  lineItems: { title: string; quantity: number; price: number }[];
  localityId?: number;
  notes?: string;
}

export interface DeliveryOrderResult {
  success: boolean;
  provider: DeliveryProviderId;
  trackingNumber: string;
  providerRef: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
  mock?: boolean;
  raw?: unknown;
}

export interface DeliveryTrackingEvent {
  status: string;
  location?: string;
  description?: string;
  occurredAt: Date;
}

export interface DeliveryTrackingResult {
  provider: DeliveryProviderId;
  trackingNumber: string;
  status: string;
  location?: string;
  updatedAt: Date;
  history: DeliveryTrackingEvent[];
  raw?: unknown;
  mock?: boolean;
}

export interface DeliveryLocality {
  locality_id: number;
  locality_name: string;
  delegation_name?: string;
  governorate_name?: string;
}

export interface DeliveryProvider {
  readonly id: DeliveryProviderId;
  isConfigured(tenantId?: string): boolean | Promise<boolean>;
  createOrder(ctx: DeliveryOrderContext): Promise<DeliveryOrderResult>;
  bulkCreate?(ctxs: DeliveryOrderContext[]): Promise<DeliveryOrderResult[]>;
  trackOrder(trackingNumber: string, tenantId?: string): Promise<DeliveryTrackingResult>;
  cancelOrder(trackingNumber: string, tenantId?: string): Promise<boolean>;
  requestPickup?(barcodes: string[], tenantId?: string): Promise<{ pickupId: string; labelUrl?: string }>;
  getLocalities?(tenantId?: string): Promise<DeliveryLocality[]>;
  generateLabel?(trackingNumber: string, tenantId?: string): Promise<{ labelUrl: string }>;
  getRates?(ctx: DeliveryOrderContext): Promise<{ rate: number; currency: string; estimatedDays: number }>;
}
