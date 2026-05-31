import type { FC } from 'react';
import type { DeliveryIntel, LocalCartItem, StoreData, StoreProduct, StoreTrust } from '@/modules/storefront/types';

export type StoreLayoutId = 'classic' | 'product-focus' | 'catalog' | 'premium' | 'service';

export type StorefrontTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  logo?: string;
  coverImage?: string;
  slogan?: string;
};

export type StorefrontProps = {
  slug: string;
  store: StoreData['store'];
  products: StoreProduct[];
  featured?: StoreProduct;
  trust: StoreTrust;
  delivery: DeliveryIntel;
  commerce: StoreData['commerce'];
  theme?: StorefrontTheme;
  intelligence: StoreData['intelligence'];
  recentlyViewed: StoreProduct[];
  productCount: number;
  onScrollToProducts?: () => void;
};

export type StorefrontTemplate = {
  id: string;
  layout: StoreLayoutId;
  name: string;
  description: string;
  previewImage?: string;
  component: FC<StorefrontProps>;
};

export type { StoreProduct, StoreTrust, DeliveryIntel, LocalCartItem };
