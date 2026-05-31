import type { StoreData, StoreProduct } from '@/modules/storefront/types';
import type { StorefrontProps, StorefrontTheme } from './types';
import { resolveUploadUrl } from '@/lib/apiConfig';

export function resolveProductImage(image?: string): string {
  if (!image?.trim()) return '';
  return resolveUploadUrl(image);
}

export function normalizeStoreProduct(product: StoreProduct): StoreProduct {
  const image = resolveProductImage(product.image);
  const images = (product.images ?? []).map((img) => resolveProductImage(img)).filter(Boolean);
  return {
    ...product,
    image: image || images[0] || '',
    images: images.length ? images : image ? [image] : [],
  };
}

export function mergeProducts(data: StoreData): StoreProduct[] {
  const map = new Map<string, StoreProduct>();
  const sources = [
    ...(data.catalog ?? []),
    data.featured,
    ...data.intelligence.trending,
    ...data.intelligence.bestSellers,
    ...data.intelligence.topRecovered,
  ].filter(Boolean) as StoreProduct[];

  for (const p of sources) {
    if (p?.id) map.set(p.id, normalizeStoreProduct(p));
  }
  return [...map.values()];
}

export function buildStorefrontProps(
  slug: string,
  data: StoreData,
  recentlyViewed: StoreProduct[] = [],
): StorefrontProps {
  const theme: StorefrontTheme | undefined = data.store.theme?.primaryColor
    ? {
        primaryColor: data.store.theme.primaryColor,
        secondaryColor: data.store.theme.secondaryColor || data.store.theme.primaryColor,
        accentColor: data.store.theme.accentColor,
        backgroundColor: data.store.theme.backgroundColor,
        textColor: data.store.theme.textColor,
      }
    : undefined;

  return {
    slug,
    store: data.store,
    products: mergeProducts(data),
    featured: data.featured ? normalizeStoreProduct(data.featured) : undefined,
    trust: data.trust,
    delivery: data.delivery,
    commerce: data.commerce,
    theme,
    intelligence: {
      ...data.intelligence,
      trending: data.intelligence.trending.map(normalizeStoreProduct),
      bestSellers: data.intelligence.bestSellers.map(normalizeStoreProduct),
      topRecovered: data.intelligence.topRecovered.map(normalizeStoreProduct),
    },
    recentlyViewed: recentlyViewed.map(normalizeStoreProduct),
    productCount: data.productCount,
  };
}

export function resolveTemplateId(data: StoreData): string {
  return data.storeTemplate || 'cod-classic';
}
