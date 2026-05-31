/** Domain events — decoupled modules communicate via EventBus only. */
export const DomainEvents = {
  CART_CREATED: 'cart.created',
  CART_UPDATED: 'cart.updated',
  CART_ABANDONED: 'cart.abandoned',
  CART_RECOVERED: 'cart.recovered',
  CHECKOUT_STARTED: 'checkout.started',
  CHECKOUT_COMPLETED: 'checkout.completed',
  ORDER_CREATED: 'order.created',
  SHIPMENT_CREATED: 'shipment.created',
  RECOVERY_SENT: 'recovery.sent',
  RECOVERY_CONVERTED: 'recovery.converted',
} as const;

export type DomainEventName = (typeof DomainEvents)[keyof typeof DomainEvents];
