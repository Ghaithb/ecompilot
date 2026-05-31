export interface BaseDomainEvent {
  tenantId: string;
  occurredAt: Date;
  eventId?: string;
  _retry?: boolean;
}

export interface CartEventPayload extends BaseDomainEvent {
  cartId: string;
  sessionId?: string;
  userId?: string;
  total?: number;
  itemCount?: number;
}

export interface CartAbandonedPayload extends CartEventPayload {
  conversionScore?: number;
  abandonmentProbability?: number;
  urgencyLevel?: 'low' | 'medium' | 'high';
  /** @deprecated use urgencyLevel */
  riskLevel?: 'low' | 'medium' | 'high';
  conversionProbability?: number;
}

export interface CartRecoveredPayload extends CartEventPayload {
  recoveryStage?: number;
  revenue?: number;
}

export interface CheckoutEventPayload extends BaseDomainEvent {
  cartId?: string;
  sessionId?: string;
  userId?: string;
  checkoutVersion?: 'A' | 'B';
  total?: number;
  frictionFlags?: string[];
  checkoutStep?: number;
  deviceType?: string;
  paymentMethod?: string;
}

export interface OrderEventPayload extends BaseDomainEvent {
  orderId: string;
  orderNumber?: string;
  total?: number;
  cartId?: string;
  fromRecovery?: boolean;
}

export interface ShipmentEventPayload extends BaseDomainEvent {
  shipmentId: string;
  orderId?: string;
  provider?: string;
  trackingNumber?: string;
}

export interface RecoveryEventPayload extends BaseDomainEvent {
  cartId: string;
  channel: 'email' | 'whatsapp' | 'sms';
  step: number;
  variant?: string;
  conversionScore?: number;
  urgencyLevel?: string;
  /** @deprecated */
  riskLevel?: string;
}
