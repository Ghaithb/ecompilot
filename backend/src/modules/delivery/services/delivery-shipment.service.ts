import { Injectable } from '@nestjs/common';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import { DeliveryOrderContext } from '../interfaces/delivery-provider.interface';
import { OrderDocument } from '../../orders/schemas/order.schema';
import { DeliveryService } from './delivery.service';

/** Façade rétrocompatible — délègue à DeliveryService. */
@Injectable()
export class DeliveryShipmentService {
  constructor(private delivery: DeliveryService) {}

  listShipments(
    tenantId: string,
    filters?: { status?: string; provider?: string },
  ) {
    return this.delivery.listShipments(tenantId, filters);
  }

  getShipmentStats(tenantId: string) {
    return this.delivery.getShipmentStats(tenantId);
  }

  createFromOrder(
    tenantId: string,
    orderId: string,
    providerId: DeliveryProviderId,
    options?: { weightKg?: number; localityId?: number; async?: boolean },
  ) {
    return this.delivery.createFromOrder(tenantId, orderId, providerId, options);
  }

  syncTracking(tenantId: string, shipmentId: string) {
    return this.delivery.syncTracking(tenantId, shipmentId);
  }

  compareRates(tenantId: string, orderId: string) {
    return this.delivery.compareRates(tenantId, orderId);
  }

  executeCreate(
    tenantId: string,
    order: OrderDocument,
    ctx: DeliveryOrderContext,
    providerId: DeliveryProviderId,
  ) {
    return this.delivery.executeCreate(tenantId, order, ctx, providerId);
  }
}
