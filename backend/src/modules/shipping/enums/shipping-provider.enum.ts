export enum ShippingProviderId {
  INTIGO = 'intigo',
  FIRST_DELIVERY = 'first_delivery',
  ARAMEX = 'aramex',
}

export const SHIPPING_PROVIDER_LABELS: Record<ShippingProviderId, string> = {
  [ShippingProviderId.INTIGO]: 'INTIGO',
  [ShippingProviderId.FIRST_DELIVERY]: 'First Delivery',
  [ShippingProviderId.ARAMEX]: 'Aramex',
};

export const SHIPPING_PROVIDER_PRIORITY: ShippingProviderId[] = [
  ShippingProviderId.INTIGO,
  ShippingProviderId.FIRST_DELIVERY,
  ShippingProviderId.ARAMEX,
];
