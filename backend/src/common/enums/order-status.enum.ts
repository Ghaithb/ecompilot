export enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  PREPARED = 'prepared',
  SHIPPED = 'shipped',
  ASSIGNED_TO_DRIVER = 'assigned_to_driver',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  PAID = 'paid',
  COMPLETED = 'completed',
  REFUSED = 'refused',
  RETURNED_TO_SELLER = 'returned_to_seller',
  RETURN_COMPLETED = 'return_completed',
  RETURN_REJECTED = 'return_rejected',
  CANCELLED = 'cancelled',
}

/** Anciens statuts encore en base */
export const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  pending: OrderStatus.CREATED,
  confirmed: OrderStatus.CONFIRMED,
  shipped: OrderStatus.SHIPPED,
  delivered: OrderStatus.DELIVERED,
  cancelled: OrderStatus.CANCELLED,
};

export function normalizeOrderStatus(status: string): OrderStatus {
  if (Object.values(OrderStatus).includes(status as OrderStatus)) {
    return status as OrderStatus;
  }
  return LEGACY_STATUS_MAP[status] || (status as OrderStatus);
}
