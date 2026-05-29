import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ShippingProviderId } from '../enums/shipping-provider.enum';
import {
  OrderShipmentContext,
  ShipmentResponse,
  ShippingProvider,
  ShippingRate,
  TrackingInfo,
} from '../interfaces/shipping-provider.interface';

export type ProviderConfigKeys = {
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
  accountNumber?: string;
  username?: string;
  password?: string;
};

export abstract class BaseShippingProvider implements ShippingProvider {
  protected readonly logger: Logger;
  protected http: AxiosInstance;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly providerId: ShippingProviderId,
    protected readonly displayName: string,
    protected readonly configPrefix: string,
  ) {
    this.logger = new Logger(`${displayName}Provider`);
    this.http = axios.create({ timeout: 30000 });
  }

  abstract getRates(context: OrderShipmentContext): Promise<ShippingRate>;
  abstract createShipment(context: OrderShipmentContext): Promise<ShipmentResponse>;
  abstract trackShipment(trackingNumber: string): Promise<TrackingInfo>;
  abstract cancelShipment(trackingNumber: string): Promise<boolean>;

  get id(): ShippingProviderId {
    return this.providerId;
  }

  get name(): string {
    return this.displayName;
  }

  protected cfg(): ProviderConfigKeys {
    const p = this.configPrefix;
    return {
      apiUrl: this.configService.get<string>(`${p}.apiUrl`) || '',
      apiKey: this.configService.get<string>(`${p}.apiKey`) || '',
      apiSecret: this.configService.get<string>(`${p}.apiSecret`),
      accountNumber: this.configService.get<string>(`${p}.accountNumber`),
      username: this.configService.get<string>(`${p}.username`),
      password: this.configService.get<string>(`${p}.password`),
    };
  }

  isConfigured(): boolean {
    const { apiUrl, apiKey } = this.cfg();
    return Boolean(apiUrl && apiKey);
  }

  protected useMock(): boolean {
    return (
      this.configService.get<string>('nodeEnv') !== 'production' &&
      !this.isConfigured()
    );
  }

  protected mockRate(context: OrderShipmentContext): ShippingRate {
    const local = (context.country || 'TN').toUpperCase() === 'TN';
    const base = local ? 7 : 22;
    return {
      provider: this.providerId,
      rate: Math.round((base + context.weightKg * 0.8) * 100) / 100,
      currency: context.currency || 'TND',
      estimatedDays: local ? 2 : 7,
      mock: true,
    };
  }

  protected mockShipment(context: OrderShipmentContext): ShipmentResponse {
    const prefix = this.providerId.substring(0, 3).toUpperCase();
    const trackingNumber = `${prefix}${Date.now().toString().slice(-10)}`;
    return {
      success: true,
      provider: this.providerId,
      trackingNumber,
      providerRef: context.orderNumber,
      labelUrl: undefined,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      mock: true,
    };
  }

  protected mockTracking(trackingNumber: string): TrackingInfo {
    return {
      provider: this.providerId,
      trackingNumber,
      status: 'in_transit',
      location: 'Tunis',
      updatedAt: new Date(),
      history: [
        { status: 'created', updatedAt: new Date(Date.now() - 86400000) },
        { status: 'in_transit', location: 'Tunis', updatedAt: new Date() },
      ],
      mock: true,
    };
  }

  protected authHeaders(): Record<string, string> {
    const { apiKey } = this.cfg();
    return {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }
}
