import axios from 'axios';
import type { CartPreview, StoreData } from './types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const http = axios.create({ baseURL });

export function getStoreSessionId(slug: string) {
  const key = `ec_store_session_${slug}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function detectDevice(): 'mobile' | 'desktop' {
  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

export async function fetchStore(slug: string): Promise<StoreData> {
  const { data } = await http.get(`/public/storefront/${slug}`);
  return data;
}

export async function fetchStoreProduct(slug: string, productId: string) {
  const { data } = await http.get(`/public/storefront/${slug}/products/${productId}`);
  return data;
}

export async function fetchCartPreview(slug: string, sessionId: string): Promise<CartPreview> {
  const { data } = await http.get(`/public/storefront/${slug}/cart/${sessionId}/preview`);
  return data;
}

export async function syncStoreCart(
  slug: string,
  sessionId: string,
  items: Array<{ productId: string; name: string; price: number; quantity: number; image?: string }>,
) {
  const { data } = await http.post(`/public/checkout/${slug}/cart/sync`, { sessionId, items });
  return data;
}

export async function fetchStoreUpsells(slug: string, productIds: string[]) {
  const { data } = await http.get(`/public/checkout/${slug}/upsells`, {
    params: { productIds: productIds.join(',') },
  });
  return data;
}

export async function trackStoreEvent(
  slug: string,
  payload: { event: string; productId?: string; deviceType?: string; sessionId?: string },
) {
  await http.post(`/public/storefront/${slug}/events`, payload).catch(() => {});
}

export async function submitStoreCheckout(
  slug: string,
  payload: {
    sessionId: string;
    address: {
      fullName: string;
      phone: string;
      email?: string;
      address: string;
      governorate: string;
      delegation?: string;
      country?: string;
    };
  },
) {
  const { data } = await http.post(`/public/checkout/${slug}/submit`, payload);
  return data;
}

export async function verifyStoreOtp(slug: string, orderId: string, code: string) {
  const { data } = await http.post(`/public/website/${slug}/orders/verify-otp`, { orderId, code });
  return data;
}

export function getRecentlyViewed(slug: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`ec_viewed_${slug}`) || '[]');
  } catch {
    return [];
  }
}

export function addRecentlyViewed(slug: string, productId: string) {
  const prev = getRecentlyViewed(slug).filter((id) => id !== productId);
  const next = [productId, ...prev].slice(0, 12);
  localStorage.setItem(`ec_viewed_${slug}`, JSON.stringify(next));
}
