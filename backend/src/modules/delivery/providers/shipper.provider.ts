import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  DeliveryOrderContext,
  DeliveryOrderResult,
  DeliveryTrackingResult,
} from '../interfaces/delivery-provider.interface';
import { ResolvedProviderConfig } from '../interfaces/provider-config.interface';
import { DeliveryCredentialsService } from '../services/delivery-credentials.service';
import { BaseDeliveryProvider } from './base-delivery.provider';

/**
 * Shipper Open API — https://shipper.network/tn/fr/documentation/api/
 */
@Injectable()
export class ShipperProvider extends BaseDeliveryProvider {
  constructor(credentials: DeliveryCredentialsService, config: ConfigService) {
    super(
      DeliveryProviderId.SHIPPER,
      'Shipper',
      'delivery.shipper',
      credentials,
      config,
    );
  }

  protected async createOrderWithConfig(
    ctx: DeliveryOrderContext,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryOrderResult> {
    const { data } = await this.http.post(
      `${cfg.apiUrl}/orders`,
      {
        external_id: ctx.orderNumber,
        recipient: { name: ctx.customerName, phone: ctx.customerPhone },
        address: {
          line1: ctx.address,
          division_1: ctx.province,
          division_2: ctx.city,
          country: ctx.country || 'TN',
        },
        cod_amount: ctx.codAmount,
        currency: ctx.currency,
        weight_kg: ctx.weightKg,
      },
      { headers: this.authHeaders(cfg.apiKey) },
    );

    const id = data?.id || data?.order_id;
    if (!id) throw new BadRequestException('Shipper: réponse invalide');

    return {
      success: true,
      provider: this.id,
      trackingNumber: String(id),
      providerRef: ctx.orderNumber,
      labelUrl: data?.label_url,
      raw: data,
    };
  }

  protected async trackOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryTrackingResult> {
    const { data } = await this.http.get(`${cfg.apiUrl}/orders/${trackingNumber}`, {
      headers: this.authHeaders(cfg.apiKey),
    });
    return {
      provider: this.id,
      trackingNumber,
      status: data?.status || 'unknown',
      updatedAt: new Date(),
      history: (data?.events || []).map((e: any) => ({
        status: e.status,
        occurredAt: new Date(e.at || Date.now()),
      })),
      raw: data,
    };
  }

  protected async cancelOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<boolean> {
    await this.http.post(
      `${cfg.apiUrl}/orders/${trackingNumber}/cancel`,
      {},
      { headers: this.authHeaders(cfg.apiKey) },
    );
    return true;
  }
}
