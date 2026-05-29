import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

export type RealtimeEvent =
  | 'order:new'
  | 'order:otp_verified'
  | 'cart:abandoned'
  | 'customer:suspect'
  | 'conversion:alert';

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  notifyTenant(tenantId: string, event: RealtimeEvent, data: Record<string, unknown>): void {
    this.gateway.emitToTenant(tenantId, event, {
      ...data,
      event,
      at: new Date().toISOString(),
    });
  }

  newOrder(tenantId: string, order: Record<string, unknown>): void {
    this.notifyTenant(tenantId, 'order:new', {
      title: 'Nouvelle commande',
      message: `Commande reçue — ${order.total ?? ''} ${order.currency ?? 'TND'}`,
      order,
    });
  }

  otpVerified(tenantId: string, order: Record<string, unknown>): void {
    this.notifyTenant(tenantId, 'order:otp_verified', {
      title: 'OTP confirmé',
      message: 'Commande COD vérifiée par SMS',
      order,
    });
  }

  abandonedCart(tenantId: string, cart: Record<string, unknown>): void {
    this.notifyTenant(tenantId, 'cart:abandoned', {
      title: 'Panier abandonné',
      message: `${cart.totalAmount ?? 0} DT récupérables`,
      cart,
    });
  }

  suspectCustomer(tenantId: string, phone: string, reason: string): void {
    this.notifyTenant(tenantId, 'customer:suspect', {
      title: 'Client suspect',
      message: reason,
      phone,
    });
  }
}
