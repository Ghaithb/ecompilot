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

@Injectable()
export class FirstDeliveryProvider extends BaseShippingProvider {
  constructor(configService: ConfigService) {
    super(configService, ShippingProviderId.FIRST_DELIVERY, 'First Delivery', 'shipping.firstDelivery');
  }

  async getRates(context: OrderShipmentContext): Promise<ShippingRate> {
    if (this.useMock()) return this.mockRate(context);
    return this.mockRate(context);
  }

  async createShipment(context: OrderShipmentContext): Promise<ShipmentResponse> {
    if (this.useMock()) {
      this.logger.warn('First Delivery: mode simulation (FIRST_DELIVERY_API_KEY manquant)');
      return this.mockShipment(context);
    }

    const { apiUrl } = this.cfg();
    const designation =
      context.lineItems.map((i) => `${i.title} x${i.quantity}`).join(', ') ||
      `Commande ${context.orderNumber}`;

    const payload = {
      Client: {
        nom: context.customerName,
        locality_id: context.localityId,
        gouvernerat: context.province,
        ville: context.city,
        adresse: context.address,
        telephone: context.customerPhone.replace(/\D/g, '').slice(-8),
        telephone2: '',
      },
      Produit: {
        prix: Math.min(999, context.codAmount ?? context.total),
        designation,
        nombreArticle: context.lineItems.reduce((s, i) => s + i.quantity, 0) || 1,
        commentaire: context.notes || `EcomPilot #${context.orderNumber}`,
        article: context.lineItems[0]?.title || 'Colis',
        nombreEchange: 0,
      },
    };

    const { data } = await this.http.post(`${apiUrl}/create`, payload, {
      headers: this.authHeaders(),
    });

    if (data?.isError) {
      throw new BadRequestException(data?.message || 'First Delivery: création échouée');
    }

    const barCode = data?.result?.barCode;
    return {
      success: true,
      provider: this.providerId,
      trackingNumber: barCode,
      providerRef: barCode,
      labelUrl: data?.result?.link,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      raw: data,
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    if (this.useMock()) return this.mockTracking(trackingNumber);

    const { apiUrl } = this.cfg();
    const { data } = await this.http.post(
      `${apiUrl}/etat`,
      { barCode: trackingNumber },
      { headers: this.authHeaders() },
    );

    const state = data?.result?.state || 'unknown';
    return {
      provider: this.providerId,
      trackingNumber,
      status: state,
      updatedAt: new Date(),
      history: [{ status: state, updatedAt: new Date() }],
      raw: data,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    if (this.useMock()) return true;

    const { apiUrl } = this.cfg();
    const { data } = await this.http.post(
      `${apiUrl}/cancel-orders`,
      { barCodes: [trackingNumber] },
      { headers: this.authHeaders() },
    );
    return !data?.isError;
  }

  async getLocalities() {
    if (this.useMock()) {
      return [
        { locality_id: 1, locality_name: 'Tunis Centre', delegation_name: 'Tunis', governorate_name: 'Tunis' },
        { locality_id: 2, locality_name: 'Sousse Medina', delegation_name: 'Sousse', governorate_name: 'Sousse' },
      ];
    }
    const { apiUrl } = this.cfg();
    const { data } = await this.http.get(`${apiUrl}/localities`, {
      headers: this.authHeaders(),
    });
    return data?.result || [];
  }
}
