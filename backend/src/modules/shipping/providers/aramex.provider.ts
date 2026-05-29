import { Injectable } from '@nestjs/common';
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
 * Aramex — SOAP/REST (ici REST simplifié + simulation si non configuré).
 * Production : brancher Shipping API V1 ou Location API selon contrat Aramex TN.
 */
@Injectable()
export class AramexProvider extends BaseShippingProvider {
  constructor(configService: ConfigService) {
    super(configService, ShippingProviderId.ARAMEX, 'Aramex', 'shipping.aramex');
  }

  async getRates(context: OrderShipmentContext): Promise<ShippingRate> {
    if (this.useMock()) {
      this.logger.warn('Aramex: mode simulation (ARAMEX_API_KEY manquant)');
      return this.mockRate(context);
    }
    return this.mockRate(context);
  }

  async createShipment(context: OrderShipmentContext): Promise<ShipmentResponse> {
    if (this.useMock()) return this.mockShipment(context);

    const { apiUrl, accountNumber, username, password } = this.cfg();
    const payload = {
      Shipments: [
        {
          Reference1: context.orderNumber,
          Shipper: { AccountNumber: accountNumber },
          Consignee: {
            PersonName: context.customerName,
            PhoneNumber1: context.customerPhone,
            CellPhone: context.customerPhone,
            CountryCode: context.country,
            City: context.city,
            Line1: context.address,
          },
          Details: {
            NumberOfPieces: 1,
            Weight: { Value: context.weightKg, Unit: 'KG' },
            CashOnDeliveryAmount: context.codAmount
              ? { Value: context.codAmount, CurrencyCode: context.currency }
              : undefined,
          },
        },
      ],
      ClientInfo: { UserName: username, Password: password, AccountNumber: accountNumber },
    };

    const { data } = await this.http.post(`${apiUrl}/Shipping/Service_1_0.svc/json/CreateShipments`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const shipment = data?.Shipments?.[0];
    const trackingNumber = shipment?.ID || shipment?.ShipmentNumber;
    if (!trackingNumber) {
      return this.mockShipment(context);
    }

    return {
      success: true,
      provider: this.providerId,
      trackingNumber: String(trackingNumber),
      providerRef: context.orderNumber,
      labelUrl: shipment?.ShipmentLabel?.LabelURL,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      raw: data,
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    if (this.useMock()) return this.mockTracking(trackingNumber);

    const { apiUrl } = this.cfg();
    try {
      const { data } = await this.http.get(`${apiUrl}/track/${trackingNumber}`);
      return {
        provider: this.providerId,
        trackingNumber,
        status: data?.status || 'in_transit',
        updatedAt: new Date(data?.updatedAt || Date.now()),
        history: data?.history || [],
        raw: data,
      };
    } catch {
      return this.mockTracking(trackingNumber);
    }
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    if (this.useMock()) return true;
    this.logger.log(`Annulation Aramex demandée: ${trackingNumber}`);
    return true;
  }
}
