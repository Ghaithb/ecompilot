export enum DeliveryProviderId {
  INTIGO = 'intigo',
  FIRST_DELIVERY = 'first_delivery',
  ARAMEX = 'aramex',
  SHIPPER = 'shipper',
  RAPID_POSTE = 'rapid_poste',
  MYLERZ = 'mylerz',
}

export const DELIVERY_PROVIDER_LABELS: Record<DeliveryProviderId, string> = {
  [DeliveryProviderId.INTIGO]: 'INTIGO',
  [DeliveryProviderId.FIRST_DELIVERY]: 'First Delivery',
  [DeliveryProviderId.ARAMEX]: 'Aramex',
  [DeliveryProviderId.SHIPPER]: 'Shipper',
  [DeliveryProviderId.RAPID_POSTE]: 'Rapid Poste (La Poste)',
  [DeliveryProviderId.MYLERZ]: 'Mylerz',
};

export const DELIVERY_PROVIDER_PRIORITY: DeliveryProviderId[] = [
  DeliveryProviderId.INTIGO,
  DeliveryProviderId.FIRST_DELIVERY,
  DeliveryProviderId.SHIPPER,
  DeliveryProviderId.ARAMEX,
  DeliveryProviderId.RAPID_POSTE,
  DeliveryProviderId.MYLERZ,
];

/** Transporteurs branchés sur le Delivery Engine MVP. */
export const MVP_DELIVERY_PROVIDERS: DeliveryProviderId[] = [
  DeliveryProviderId.INTIGO,
  DeliveryProviderId.FIRST_DELIVERY,
  DeliveryProviderId.SHIPPER,
];
