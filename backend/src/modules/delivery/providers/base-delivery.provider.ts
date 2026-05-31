import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  CreateShipmentData,
  DeliveryProviderIntegration,
  PickupRequestData,
} from '../integration/shipment-provider.interface';
import {
  normalizeShipmentResult,
  normalizeTrackingResult,
} from '../utils/shipment-response.normalizer';
import {
  DeliveryOrderContext,
  DeliveryOrderResult,
  DeliveryProvider,
  DeliveryTrackingResult,
} from '../interfaces/delivery-provider.interface';
import { ResolvedProviderConfig } from '../interfaces/provider-config.interface';
import { DeliveryCredentialsService } from '../services/delivery-credentials.service';

export abstract class BaseDeliveryProvider implements DeliveryProvider, DeliveryProviderIntegration {
  protected readonly logger: Logger;
  protected readonly http: AxiosInstance;

  get providerId(): DeliveryProviderId {
    return this.id;
  }

  constructor(
    readonly id: DeliveryProviderId,
    protected readonly displayName: string,
    protected readonly configKey: string,
    protected readonly credentials: DeliveryCredentialsService,
    protected readonly config: ConfigService,
  ) {
    this.logger = new Logger(`${displayName}Provider`);
    this.http = axios.create({ timeout: 30000 });
  }

  async isConfigured(tenantId?: string): Promise<boolean> {
    const cfg = await this.resolveConfig(tenantId || '');
    return cfg.source !== 'none';
  }

  protected async resolveConfig(tenantId: string): Promise<ResolvedProviderConfig> {
    return this.credentials.resolveProviderConfig(tenantId, this.id, this.configKey);
  }

  protected authHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  protected mockResult(ctx: DeliveryOrderContext): DeliveryOrderResult {
    const prefix = this.id.substring(0, 3).toUpperCase();
    return {
      success: true,
      provider: this.id,
      trackingNumber: `${prefix}${Date.now().toString().slice(-10)}`,
      providerRef: ctx.orderNumber,
      mock: true,
    };
  }

  protected mockTracking(trackingNumber: string): DeliveryTrackingResult {
    return {
      provider: this.id,
      trackingNumber,
      status: 'in_transit',
      updatedAt: new Date(),
      history: [{ status: 'in_transit', occurredAt: new Date() }],
      mock: true,
    };
  }

  /** Implémentation DeliveryProvider — résout config tenant à chaque appel */
  async createOrder(ctx: DeliveryOrderContext): Promise<DeliveryOrderResult> {
    const cfg = await this.resolveConfig(ctx.tenantId);
    if (cfg.mock) {
      this.logger.warn(`${this.displayName}: simulation (tenant=${ctx.tenantId})`);
      return this.mockResult(ctx);
    }
    return this.createOrderWithConfig(ctx, cfg);
  }

  async trackOrder(trackingNumber: string, tenantId?: string): Promise<DeliveryTrackingResult> {
    const cfg = await this.resolveConfig(tenantId || '');
    if (cfg.mock) return this.mockTracking(trackingNumber);
    return this.trackOrderWithConfig(trackingNumber, cfg, tenantId);
  }

  async cancelOrder(trackingNumber: string, tenantId?: string): Promise<boolean> {
    const cfg = await this.resolveConfig(tenantId || '');
    if (cfg.mock) return true;
    return this.cancelOrderWithConfig(trackingNumber, cfg);
  }

  /** Integration layer — alias explicites (ShipStation-style) */
  async createShipment(tenantId: string, data: CreateShipmentData) {
    const result = await this.createOrder(this.toOrderContext(data));
    return normalizeShipmentResult(this.id, result);
  }

  async trackShipment(tenantId: string, trackingNumber: string) {
    const result = await this.trackOrder(trackingNumber, tenantId);
    return normalizeTrackingResult(result);
  }

  async cancelShipment(tenantId: string, trackingNumber: string) {
    return this.cancelOrder(trackingNumber, tenantId);
  }

  async requestPickup(tenantId: string, data: PickupRequestData) {
    if (!this.requestPickupLegacy) {
      throw new Error(`${this.displayName}: requestPickup non supporté`);
    }
    const res = await this.requestPickupLegacy(data.barcodes, tenantId);
    return {
      pickupId: res.pickupId,
      labelUrl: res.labelUrl,
    };
  }

  /** Override dans FirstDeliveryProvider */
  protected requestPickupLegacy?(
    barcodes: string[],
    tenantId?: string,
  ): Promise<{ pickupId: string; labelUrl?: string }>;

  protected toOrderContext(data: CreateShipmentData): DeliveryOrderContext {
    return {
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      tenantId: data.tenantId,
      customerName: data.recipient.name,
      customerPhone: data.recipient.phone,
      customerEmail: data.recipient.email,
      address: data.recipient.address,
      city: data.recipient.city,
      province: data.recipient.province,
      country: data.recipient.country,
      weightKg: data.parcel.weightKg,
      codAmount: data.parcel.codAmount,
      currency: data.parcel.currency,
      total: data.parcel.total,
      lineItems: data.parcel.lineItems,
      localityId: data.localityId,
      notes: data.notes,
    };
  }

  protected abstract createOrderWithConfig(
    ctx: DeliveryOrderContext,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryOrderResult>;

  protected abstract trackOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
    tenantId?: string,
  ): Promise<DeliveryTrackingResult>;

  protected abstract cancelOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<boolean>;
}
