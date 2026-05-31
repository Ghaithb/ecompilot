export type StoreProduct = {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  inStock: boolean;
  sku?: string;
};

export type DeliveryIntel = {
  estimatedDays: number;
  estimatedLabel: string;
  deliveryConfidence: number;
  bestCarrier: string;
  carrierLabel: string;
  message: string;
};

export type StoreTrust = {
  badges: Array<{ id: string; label: string }>;
  codTrust: { headline: string; bullets: string[] };
  whatsappSupport?: string;
  merchantName?: string;
};

export type StoreData = {
  store: {
    name: string;
    slug: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      backgroundColor?: string;
      textColor?: string;
      logo?: string;
      favicon?: string;
      coverImage?: string;
      slogan?: string;
    };
    currency: string;
  };
  storeTemplate?: string;
  templateLayout?: 'classic' | 'product-focus' | 'catalog' | 'premium' | 'service';
  analytics?: { googleAnalyticsId?: string; facebookPixelId?: string };
  trust: StoreTrust;
  delivery: DeliveryIntel;
  commerce: { freeShippingThreshold: number; defaultShipping: number };
  featured?: StoreProduct;
  intelligence: {
    trending: StoreProduct[];
    bestSellers: StoreProduct[];
    topRecovered: StoreProduct[];
  };
  productCount: number;
  catalog?: StoreProduct[];
};

export type CartPreview = {
  items: Array<{ productId: string; name: string; price: number; quantity: number; image?: string; subtotal: number }>;
  totals: { subtotal: number; shipping: number; total: number; tax: number; discount: number };
  freeShipping: { threshold: number; remaining: number; progress: number; unlocked: boolean };
  shippingPreview: { estimatedCost: number; estimatedDays: number; provider: string };
  upsells: StoreProduct[];
  trust: StoreTrust;
  delivery: DeliveryIntel;
};

export type LocalCartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};
