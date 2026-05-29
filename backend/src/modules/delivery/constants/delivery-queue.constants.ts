/** File Bull (@nestjs/bull) — même contrat qu’une migration BullMQ. */
export const DELIVERY_QUEUE_NAME = 'delivery';

export enum DeliveryJobName {
  CREATE_SHIPMENT = 'create-shipment',
  SYNC_TRACKING = 'sync-tracking',
}

export type DeliveryQueuePayload = {
  tenantId: string;
  orderId: string;
  providerId: string;
  weightKg?: number;
  localityId?: number;
  attempt?: number;
};
