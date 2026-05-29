import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShippingProviderId } from '../enums/shipping-provider.enum';
import {
  OrderShipmentContext,
  ShipmentResponse,
  ShippingRate,
  TrackingInfo,
} from '../interfaces/shipping-provider.interface';
import { BaseShippingProvider } from './base-shipping.provider';

/**
 * INTIGO — API REST partenaire (URL/chemins configurables via .env).
 * Contact INTIGO pour obtenir apiUrl + apiKey officiels.
 */
@Injectable()
export class IntigoProvider extends BaseShippingProvider {
  constructor(configService: ConfigService) {
    super(configService, ShippingProviderId.INTIGO, 'INTIGO', 'shipping.intigo');
  }

  private paths() {
    const paths = this.configService.get<{ create?: string; track?: string; rates?: string; cancel?: string }>(
      'shipping.intigo.paths',
    );
    return {
      create: paths?.create || '/api/v1/shipments',
      track: paths?.track || '/api/v1/shipments',
      rates: paths?.rates || '/api/v1/rates',
      cancel: paths?.cancel || '/api/v1/shipments',
    };
  }

  async getRates(context: OrderShipmentContext): Promise<ShippingRate> {
    if (this.useMock()) {
      this.logger.warn('INTIGO: mode simulation (INTIGO_API_KEY manquant)');
      return this.mockRate(context);
    }

    const { apiUrl } = this.cfg();
    try {
      const { data } = await this.http.post(
        `${apiUrl}${this.paths().rates}`,
        {
          origin_city: 'Tunis',
          destination_governorate: context.province,
          destination_city: context.city,
          weight_kg: context.weightKg,
          cod_amount: context.codAmount,
        },
        { headers: this.authHeaders() },
      );
      return {
        provider: this.providerId,
        rate: data?.rate ?? data?.price ?? this.mockRate(context).rate,
        currency: data?.currency || context.currency,
        estimatedDays: data?.estimated_days ?? 2,
      };
    } catch {
      return this.mockRate(context);
    }
  }

  async createShipment(context: OrderShipmentContext): Promise<ShipmentResponse> {
    if (this.useMock()) return this.mockShipment(context);

    const { apiUrl } = this.cfg();
    const payload = {
      external_ref: context.orderNumber,
      recipient: {
        name: context.customerName,
        phone: context.customerPhone,
        address: context.address,
        city: context.city,
        governorate: context.province,
        country: context.country,
      },
      parcel: {
        weight_kg: context.weightKg,
        cod_amount: context.codAmount,
        currency: context.currency,
        description: context.lineItems.map((i) => i.title).join(', '),
      },
      notes: context.notes,
    };

    const { data } = await this.http.post(`${apiUrl}${this.paths().create}`, payload, {
      headers: this.authHeaders(),
    });

    const trackingNumber = data?.tracking_number || data?.trackingNumber || data?.id;
    if (!trackingNumber) {
      throw new BadRequestException('INTIGO: réponse sans numéro de suivi');
    }

    return {
      success: true,
      provider: this.providerId,
      trackingNumber: String(trackingNumber),
      providerRef: data?.reference || context.orderNumber,
      labelUrl: data?.label_url || data?.labelUrl,
      estimatedDelivery: data?.estimated_delivery
        ? new Date(data.estimated_delivery)
        : new Date(Date.now() + 24 * 60 * 60 * 1000),
      raw: data,
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    if (this.useMock()) return this.mockTracking(trackingNumber);

    const { apiUrl } = this.cfg();
    const { data } = await this.http.get(`${apiUrl}${this.paths().track}/${trackingNumber}`, {
      headers: this.authHeaders(),
    });

    const history = (data?.history || data?.events || []).map((e: any) => ({
      status: e.status || e.state,
      location: e.location,
      updatedAt: new Date(e.updated_at || e.date || Date.now()),
      description: e.description,
    }));

    return {
      provider: this.providerId,
      trackingNumber,
      status: data?.status || history[history.length - 1]?.status || 'unknown',
      location: data?.location,
      updatedAt: new Date(data?.updated_at || Date.now()),
      history: history.length ? history : [{ status: data?.status, updatedAt: new Date() }],
      raw: data,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    if (this.useMock()) return true;

    const { apiUrl } = this.cfg();
    await this.http.post(
      `${apiUrl}${this.paths().cancel}/${trackingNumber}/cancel`,
      {},
      { headers: this.authHeaders() },
    );
    return true;
  }
}
