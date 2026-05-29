import { ShippingProviderId } from '../enums/shipping-provider.enum';

export interface ShipmentLineItem {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderShipmentContext {
  orderId: string;
  orderNumber: string;
  tenantId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip?: string;
  weightKg: number;
  codAmount?: number;
  currency: string;
  total: number;
  lineItems: ShipmentLineItem[];
  localityId?: number;
  notes?: string;
}

export interface ShippingRate {
  provider: ShippingProviderId;
  rate: number;
  currency: string;
  estimatedDays: number;
  mock?: boolean;
}

export interface ShipmentResponse {
  success: boolean;
  provider: ShippingProviderId;
  trackingNumber: string;
  providerRef: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
  raw?: unknown;
  mock?: boolean;
}

export interface TrackingEvent {
  status: string;
  location?: string;
  updatedAt: Date;
  description?: string;
}

export interface TrackingInfo {
  provider: ShippingProviderId;
  trackingNumber: string;
  status: string;
  location?: string;
  updatedAt: Date;
  history: TrackingEvent[];
  raw?: unknown;
  mock?: boolean;
}

export interface ShippingProvider {
  readonly id: ShippingProviderId;
  isConfigured(): boolean;
  getRates(context: OrderShipmentContext): Promise<ShippingRate>;
  createShipment(context: OrderShipmentContext): Promise<ShipmentResponse>;
  trackShipment(trackingNumber: string): Promise<TrackingInfo>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
}
