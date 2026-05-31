import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartPreview, LocalCartItem, StoreData } from '../types';
import {
  addRecentlyViewed,
  detectDevice,
  fetchCartPreview,
  getRecentlyViewed,
  getStoreSessionId,
  syncStoreCart,
  trackStoreEvent,
} from '../api/storefrontApi';

type StorefrontContextValue = {
  slug: string;
  sessionId: string;
  store: StoreData | null;
  items: LocalCartItem[];
  preview: CartPreview | null;
  cartOpen: boolean;
  itemCount: number;
  subtotal: number;
  setStore: (s: StoreData) => void;
  setCartOpen: (o: boolean) => void;
  addItem: (item: LocalCartItem) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshPreview: () => Promise<void>;
  viewProduct: (productId: string) => void;
  recentlyViewedIds: string[];
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function loadLocalCart(slug: string): LocalCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(`ec_cart_${slug}`) || '[]');
  } catch {
    return [];
  }
}

function saveLocalCart(slug: string, items: LocalCartItem[]) {
  localStorage.setItem(`ec_cart_${slug}`, JSON.stringify(items));
}

export function StorefrontProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const sessionId = useMemo(() => getStoreSessionId(slug), [slug]);
  const [store, setStore] = useState<StoreData | null>(null);
  const [items, setItems] = useState<LocalCartItem[]>(() => loadLocalCart(slug));
  const [preview, setPreview] = useState<CartPreview | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => getRecentlyViewed(slug));

  const persist = useCallback(
    async (next: LocalCartItem[]) => {
      setItems(next);
      saveLocalCart(slug, next);
      await syncStoreCart(slug, sessionId, next);
      const p = await fetchCartPreview(slug, sessionId);
      setPreview(p);
    },
    [slug, sessionId],
  );

  const refreshPreview = useCallback(async () => {
    if (!items.length) {
      setPreview(null);
      return;
    }
    await syncStoreCart(slug, sessionId, items);
    const p = await fetchCartPreview(slug, sessionId);
    setPreview(p);
  }, [items, slug, sessionId]);

  useEffect(() => {
    if (items.length) refreshPreview().catch(() => {});
  }, [items.length, refreshPreview]);

  useEffect(() => {
    trackStoreEvent(slug, { event: 'store_view', deviceType: detectDevice(), sessionId });
  }, [slug, sessionId]);

  const addItem = async (item: LocalCartItem) => {
    const existing = items.find((i) => i.productId === item.productId);
    const next = existing
      ? items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        )
      : [...items, item];
    await persist(next);
    await trackStoreEvent(slug, {
      event: 'add_to_cart',
      productId: item.productId,
      deviceType: detectDevice(),
      sessionId,
    });
    setCartOpen(true);
  };

  const updateQty = async (productId: string, quantity: number) => {
    const next =
      quantity <= 0
        ? items.filter((i) => i.productId !== productId)
        : items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    await persist(next);
  };

  const removeItem = async (productId: string) => {
    await persist(items.filter((i) => i.productId !== productId));
  };

  const viewProduct = (productId: string) => {
    addRecentlyViewed(slug, productId);
    setRecentlyViewedIds(getRecentlyViewed(slug));
    trackStoreEvent(slug, {
      event: 'product_view',
      productId,
      deviceType: detectDevice(),
      sessionId,
    });
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <StorefrontContext.Provider
      value={{
        slug,
        sessionId,
        store,
        items,
        preview,
        cartOpen,
        itemCount,
        subtotal,
        setStore,
        setCartOpen,
        addItem,
        updateQty,
        removeItem,
        refreshPreview,
        viewProduct,
        recentlyViewedIds,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used within StorefrontProvider');
  return ctx;
}
