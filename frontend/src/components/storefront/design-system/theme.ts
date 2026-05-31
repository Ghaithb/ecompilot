import type { CSSProperties } from 'react';
import type { StorefrontTheme } from '@/templates/storefront/types';

export type StoreLayoutId = 'classic' | 'product-focus' | 'catalog' | 'premium' | 'service';

export const DEFAULT_STORE_THEME: StorefrontTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#1d4ed8',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#111827',
};

export function buildStoreThemeStyle(theme?: StorefrontTheme): CSSProperties {
  const t = { ...DEFAULT_STORE_THEME, ...theme };
  return {
    '--store-primary': t.primaryColor,
    '--store-secondary': t.secondaryColor,
    '--store-accent': t.accentColor || t.primaryColor,
    '--store-bg': t.backgroundColor || '#ffffff',
    '--store-text': t.textColor || '#111827',
    '--store-primary-soft': `${t.primaryColor}18`,
    '--store-radius': '1rem',
    '--store-radius-lg': '1.5rem',
    '--store-gutter': '1.25rem',
    '--store-max': '90rem',
  } as CSSProperties;
}

export function getStoreLayoutClass(layout?: string | null): string {
  switch (layout) {
    case 'product-focus':
      return 'store-layout-product-focus';
    case 'catalog':
      return 'store-layout-catalog';
    case 'premium':
      return 'store-layout-premium';
    case 'service':
      return 'store-layout-service';
    default:
      return 'store-layout-classic';
  }
}

export function layoutFromTemplateId(templateId?: string | null): StoreLayoutId {
  switch (templateId) {
    case 'cod-minimal':
      return 'product-focus';
    case 'cod-bold':
      return 'catalog';
    case 'cod-trust':
      return 'premium';
    case 'cod-instagram':
      return 'service';
    default:
      return 'classic';
  }
}
