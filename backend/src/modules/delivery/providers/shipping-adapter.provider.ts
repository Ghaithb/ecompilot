import { ShippingProvider } from '../../shipping/interfaces/shipping-provider.interface';
import { OrderShipmentContext } from '../../shipping/interfaces/shipping-provider.interface';
import { ShippingProviderId } from '../../shipping/enums/shipping-provider.enum';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  DeliveryOrderContext,
  DeliveryOrderResult,
  DeliveryProvider,
  DeliveryTrackingResult,
} from '../interfaces/delivery-provider.interface';

const SHIPPING_TO_DELIVERY: Record<ShippingProviderId, DeliveryProviderId> = {
  [ShippingProviderId.INTIGO]: DeliveryProviderId.INTIGO,
  [ShippingProviderId.FIRST_DELIVERY]: DeliveryProviderId.FIRST_DELIVERY,
  [ShippingProviderId.ARAMEX]: DeliveryProviderId.ARAMEX,
};

export function mapToShippingContext(ctx: DeliveryOrderContext): OrderShipmentContext {
  return {
    orderId: ctx.orderId,
    orderNumber: ctx.orderNumber,
    tenantId: ctx.tenantId,
    customerName: ctx.customerName,
    customerEmail: ctx.customerEmail || `${ctx.orderNumber}@ecompilot.local`,
    customerPhone: ctx.customerPhone,
    address: ctx.address,
    city: ctx.city,
    province: ctx.province,
    country: ctx.country,
    weightKg: ctx.weightKg,
    codAmount: ctx.codAmount,
    currency: ctx.currency,
    total: ctx.total,
    lineItems: ctx.lineItems,
    localityId: ctx.localityId,
    notes: ctx.notes,
  };
}

/** Adapte les providers du module shipping legacy vers l'interface DeliveryProvider */
export class ShippingAdapterProvider implements DeliveryProvider {
  constructor(
    private readonly inner: ShippingProvider,
    private readonly deliveryId: DeliveryProviderId,
    private readonly extras?: {
      getLocalities?: () => Promise<any[]>;
      requestPickup?: (barcodes: string[]) => Promise<{ pickupId: string; labelUrl?: string }>;
      generateLabel?: (tracking: string) => Promise<{ labelUrl: string }>;
    },
  ) {}

  get id() {
    return this.deliveryId;
  }

  isConfigured(): boolean {
    return this.inner.isConfigured();
  }

  async createOrder(ctx: DeliveryOrderContext): Promise<DeliveryOrderResult> {
    const res = await this.inner.createShipment(mapToShippingContext(ctx));
    return {
      success: res.success,
      provider: this.deliveryId,
      trackingNumber: res.trackingNumber,
      providerRef: res.providerRef,
      labelUrl: res.labelUrl,
      estimatedDelivery: res.estimatedDelivery,
      mock: res.mock,
      raw: res.raw,
    };
  }

  async trackOrder(trackingNumber: string): Promise<DeliveryTrackingResult> {
    const t = await this.inner.trackShipment(trackingNumber);
    return {
      provider: this.deliveryId,
      trackingNumber: t.trackingNumber,
      status: t.status,
      location: t.location,
      updatedAt: t.updatedAt,
      history: t.history.map((h) => ({
        status: h.status,
        location: h.location,
        description: h.description,
        occurredAt: h.updatedAt,
      })),
      raw: t.raw,
      mock: t.mock,
    };
  }

  async cancelOrder(trackingNumber: string): Promise<boolean> {
    return this.inner.cancelShipment(trackingNumber);
  }

  async getRates(ctx: DeliveryOrderContext) {
    const r = await this.inner.getRates(mapToShippingContext(ctx));
    return { rate: r.rate, currency: r.currency, estimatedDays: r.estimatedDays };
  }

  async getLocalities() {
    return this.extras?.getLocalities?.() || [];
  }

  async requestPickup(barcodes: string[]) {
    if (!this.extras?.requestPickup) {
      throw new Error('Pickup non supporté pour ce transporteur');
    }
    return this.extras.requestPickup(barcodes);
  }

  async generateLabel(trackingNumber: string) {
    if (!this.extras?.generateLabel) {
      return { labelUrl: '' };
    }
    return this.extras.generateLabel(trackingNumber);
  }
}

export function shippingIdToDeliveryId(id: ShippingProviderId): DeliveryProviderId {
  return SHIPPING_TO_DELIVERY[id];
}
