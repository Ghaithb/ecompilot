import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import {
  DeliveryLocality,
  DeliveryOrderContext,
  DeliveryOrderResult,
  DeliveryTrackingResult,
} from '../interfaces/delivery-provider.interface';
import { ResolvedProviderConfig } from '../interfaces/provider-config.interface';
import { DeliveryCredentialsService } from '../services/delivery-credentials.service';
import { BaseDeliveryProvider } from './base-delivery.provider';

/**
 * First Delivery API v2 — https://www.firstdeliverygroup.com/api/v2/documentation
 */
@Injectable()
export class FirstDeliveryProvider extends BaseDeliveryProvider {
  constructor(credentials: DeliveryCredentialsService, config: ConfigService) {
    super(
      DeliveryProviderId.FIRST_DELIVERY,
      'First Delivery',
      'shipping.firstDelivery',
      credentials,
      config,
    );
  }

  protected async createOrderWithConfig(
    ctx: DeliveryOrderContext,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryOrderResult> {
    const designation =
      ctx.lineItems.map((i) => `${i.title} x${i.quantity}`).join(', ') ||
      `Commande ${ctx.orderNumber}`;

    const payload = {
      Client: {
        nom: ctx.customerName,
        locality_id: ctx.localityId,
        gouvernerat: ctx.province,
        ville: ctx.city,
        adresse: ctx.address,
        telephone: ctx.customerPhone.replace(/\D/g, '').slice(-8),
        telephone2: '',
      },
      Produit: {
        prix: Math.min(999, ctx.codAmount ?? ctx.total),
        designation,
        nombreArticle: ctx.lineItems.reduce((s, i) => s + i.quantity, 0) || 1,
        commentaire: ctx.notes || `EcomPilot #${ctx.orderNumber}`,
        article: ctx.lineItems[0]?.title || 'Colis',
        nombreEchange: 0,
      },
    };

    const { data } = await this.http.post(`${cfg.apiUrl}/create`, payload, {
      headers: this.authHeaders(cfg.apiKey),
    });

    if (data?.isError) {
      throw new BadRequestException(data?.message || 'First Delivery: création échouée');
    }

    const barCode = data?.result?.barCode;
    return {
      success: true,
      provider: this.id,
      trackingNumber: barCode,
      providerRef: barCode,
      labelUrl: data?.result?.link,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      raw: data,
    };
  }

  protected async trackOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<DeliveryTrackingResult> {
    const { data } = await this.http.post(
      `${cfg.apiUrl}/etat`,
      { barCode: trackingNumber },
      { headers: this.authHeaders(cfg.apiKey) },
    );
    const state = data?.result?.state || 'unknown';
    return {
      provider: this.id,
      trackingNumber,
      status: this.normalizeStatus(state),
      updatedAt: new Date(),
      history: [{ status: state, occurredAt: new Date() }],
      raw: data,
    };
  }

  protected async cancelOrderWithConfig(
    trackingNumber: string,
    cfg: ResolvedProviderConfig,
  ): Promise<boolean> {
    const { data } = await this.http.post(
      `${cfg.apiUrl}/cancel-orders`,
      { barCodes: [trackingNumber] },
      { headers: this.authHeaders(cfg.apiKey) },
    );
    return !data?.isError;
  }

  async getLocalities(tenantId?: string): Promise<DeliveryLocality[]> {
    const cfg = await this.resolveConfig(tenantId || '');
    if (cfg.mock) {
      return [
        { locality_id: 1, locality_name: 'Tunis Centre', governorate_name: 'Tunis' },
        { locality_id: 2, locality_name: 'Sousse Medina', governorate_name: 'Sousse' },
      ];
    }
    const { data } = await this.http.get(`${cfg.apiUrl}/localities`, {
      headers: this.authHeaders(cfg.apiKey),
    });
    return data?.result || [];
  }

  protected async requestPickupLegacy(barcodes: string[], tenantId?: string) {
    const cfg = await this.resolveConfig(tenantId || '');
    if (cfg.mock) {
      return { pickupId: `MOCK-PICKUP-${Date.now()}`, labelUrl: undefined };
    }
    const { data } = await this.http.post(
      `${cfg.apiUrl}/pickup`,
      { barCodes: barcodes },
      { headers: this.authHeaders(cfg.apiKey) },
    );
    return {
      pickupId: data?.result?.pickup,
      labelUrl: data?.result?.link,
    };
  }

  private normalizeStatus(state: string): string {
    const s = state?.toLowerCase() || '';
    if (s.includes('livr')) return 'delivered';
    if (s.includes('attente')) return 'created';
    if (s.includes('cours') || s.includes('route')) return 'in_transit';
    if (s.includes('retour') || s.includes('refus')) return 'refused';
    return 'in_transit';
  }
}
