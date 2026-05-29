import { Injectable, Logger } from '@nestjs/common';

/** Stub MVP — remplace WebSocket realtime (module archivé dans /future). */
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger('RealtimeService(stub)');

  notifyTenant(_tenantId: string, _event: string, _data: Record<string, unknown>): void {}

  newOrder(_tenantId: string, _order: Record<string, unknown>): void {}

  otpVerified(_tenantId: string, _order: Record<string, unknown>): void {}

  abandonedCart(tenantId: string, cart: Record<string, unknown>): void {
    this.logger.debug(`[MVP] abandoned cart ignored tenant=${tenantId}`);
  }

  suspectCustomer(_tenantId: string, _phone: string, _reason: string): void {}
}
