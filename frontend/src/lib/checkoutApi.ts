import { api } from '@/lib/api';

export type CheckoutQuote = {
  shipping: number;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  quotes: Array<{
    provider: string;
    rate: number;
    currency: string;
    estimatedDays: number;
  }>;
  best?: {
    provider: string;
    rate: number;
    currency: string;
    estimatedDays: number;
  };
  estimatedDeliveryAt?: string;
  deliveryConfidence?: number;
  intelligence?: {
    conversionScore: number;
    abandonmentProbability?: number;
    urgencyLevel?: string;
    riskLevel?: string;
    conversionProbability: number;
  };
  optimization?: {
    limitedTimeDeliveryGuarantee?: boolean;
    deliverySensitivityWarning?: string;
    frictionTooltips?: string;
    deliveryConfidence?: number;
  };
  trust?: {
    badges: Array<{ id: string; label: string; icon: string }>;
    codTrust?: { headline: string; bullets: string[] };
  };
};

export type UpsellProduct = {
  id: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
};

function detectDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

export async function startCheckoutSession() {
  const { data } = await api.post('/checkout/start', { deviceType: detectDeviceType() });
  return data;
}

export async function trackCheckoutStep(payload: {
  step: number;
  address?: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    governorate: string;
    delegation?: string;
  };
}) {
  const { data } = await api.post('/checkout/track-step', {
    ...payload,
    deviceType: detectDeviceType(),
    paymentMethod: 'cod',
  });
  return data;
}

export async function predictCheckoutAbandonment(payload: {
  address?: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    governorate: string;
    delegation?: string;
  };
}) {
  const { data } = await api.post('/checkout/predict-abandonment', payload);
  return data as {
    abandonRisk: number;
    abandonmentProbability?: number;
    conversionScore?: number;
    urgencyLevel?: string;
    riskLevel: string;
    frictionFlags: string[];
    deliveryPriceSensitive?: boolean;
    showExitWarning: boolean;
    showDeliveryGuarantee?: boolean;
    frictionTooltips?: Array<{ flag: string; message: string }>;
    codTrust?: { headline: string; bullets: string[] };
    message: string;
  };
}

export async function fetchCheckoutQuote(payload: {
  address?: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    governorate: string;
    delegation?: string;
  };
}): Promise<CheckoutQuote> {
  const { data } = await api.post('/checkout/quote', payload);
  return data;
}

export async function fetchCheckoutUpsells(productIds: string[]): Promise<UpsellProduct[]> {
  if (!productIds.length) return [];
  const { data } = await api.get('/checkout/upsells', {
    params: { productIds: productIds.join(',') },
  });
  return data;
}

export async function submitCheckout(payload: {
  address: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    governorate: string;
    delegation?: string;
    country?: string;
  };
}) {
  const { data } = await api.post('/checkout/submit', payload);
  return data;
}

export async function fetchCheckoutTrust() {
  const { data } = await api.get('/checkout/trust');
  return data;
}
