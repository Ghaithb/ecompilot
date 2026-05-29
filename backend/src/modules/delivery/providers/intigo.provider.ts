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
 * INTIGO — REST partenaire (URLs/chemins configurables par boutique ou .env).
 */
@Injectable()
export class IntigoProvider extends BaseDeliveryProvider {
  constructor(credentials: DeliveryCredentialsService, config: ConfigService) {
    super(DeliveryProviderId.INTIGO, 'INTIGO', 'shipping.intigo', credentials, config);
  }

  private paths(cfg: ResolvedProviderConfig) {
    return {
      create: cfg.extra?.pathCreate || '/api/v1/shipments',
      track: cfg.extra?.pathTrack || '/api/v1/shipments',
      cancel: cfg.extra?.pathCancel || '/api/v1/shipments',
    };
  }

  protected async createOrderWithConfig(
    ctx: DeliveryOrderContext,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryOrderResult> {
    const p = this.paths(cfg);
    const payload = {
      external_ref: ctx.orderNumber,
      recipient: {
        name: ctx.customerName,
        phone: ctx.customerPhone,
        address: ctx.address,
        city: ctx.city,
        governorate: ctx.province,
        country: ctx.country,
      },
      parcel: {
        weight_kg: ctx.weightKg,
        cod_amount: ctx.codAmount,
        currency: ctx.currency,
        description: ctx.lineItems.map((i) => i.title).join(', '),
      },
      notes: ctx.notes,
    };

    const { data } = await this.http.post(`${cfg.apiUrl}${p.create}`, payload, {
      headers: this.authHeaders(cfg.apiKey),
    });

    const trackingNumber = data?.tracking_number || data?.trackingNumber || data?.id;
    if (!trackingNumber) {
      throw new BadRequestException('INTIGO: réponse sans numéro de suivi');
    }

    return {
      success: true,
      provider: this.id,
      trackingNumber: String(trackingNumber),
      providerRef: data?.reference || ctx.orderNumber,
      labelUrl: data?.label_url || data?.labelUrl,
      estimatedDelivery: data?.estimated_delivery
        ? new Date(data.estimated_delivery)
        : undefined,
      raw: data,
    };
  }

  protected async trackOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryTrackingResult> {
    const p = this.paths(cfg);
    const { data } = await this.http.get(`${cfg.apiUrl}${p.track}/${trackingNumber}`, {
      headers: this.authHeaders(cfg.apiKey),
    });

    const history = (data?.history || data?.events || []).map((e: any) => ({
      status: e.status || e.state,
      location: e.location,
      occurredAt: new Date(e.updated_at || e.date || Date.now()),
      description: e.description,
    }));

    return {
      provider: this.id,
      trackingNumber,
      status: data?.status || history[history.length - 1]?.status || 'unknown',
      location: data?.location,
      updatedAt: new Date(data?.updated_at || Date.now()),
      history: history.length ? history : [{ status: data?.status, occurredAt: new Date() }],
      raw: data,
    };
  }

  protected async cancelOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<boolean> {
    const p = this.paths(cfg);
    await this.http.post(
      `${cfg.apiUrl}${p.cancel}/${trackingNumber}/cancel`,
      {},
      { headers: this.authHeaders(cfg.apiKey) },
    );
    return true;
  }

  async getRates(ctx: DeliveryOrderContext) {
    const cfg = await this.resolveConfig(ctx.tenantId);
    if (cfg.mock) {
      return { rate: 8, currency: ctx.currency, estimatedDays: 2 };
    }
    try {
      const path = cfg.extra?.pathRates || '/api/v1/rates';
      const { data } = await this.http.post(
        `${cfg.apiUrl}${path}`,
        {
          destination_governorate: ctx.province,
          destination_city: ctx.city,
          weight_kg: ctx.weightKg,
          cod_amount: ctx.codAmount,
        },
        { headers: this.authHeaders(cfg.apiKey) },
      );
      return {
        rate: data?.rate ?? data?.price ?? 8,
        currency: data?.currency || ctx.currency,
        estimatedDays: data?.estimated_days ?? 2,
      };
    } catch {
      return { rate: 8, currency: ctx.currency, estimatedDays: 2 };
    }
  }
}
