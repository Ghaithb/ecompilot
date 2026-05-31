import { useEffect } from 'react';
import { useStorefront } from '../context/StorefrontContext';
import { initStoreTracking } from '../lib/storeTracking';

/** Inject GA4 + Meta Pixel when store analytics config is loaded */
export function StoreTracking() {
  const { store } = useStorefront();

  useEffect(() => {
    if (store?.analytics) {
      initStoreTracking(store.analytics);
    }
  }, [store?.analytics]);

  return null;
}
