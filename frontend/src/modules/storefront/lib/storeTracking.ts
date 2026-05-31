type StoreAnalyticsConfig = {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

let initializedKey = '';

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function initStoreTracking(analytics?: StoreAnalyticsConfig) {
  if (!analytics) return;
  const key = `${analytics.googleAnalyticsId || ''}-${analytics.facebookPixelId || ''}`;
  if (key === initializedKey) return;
  initializedKey = key;

  if (analytics.googleAnalyticsId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', analytics.googleAnalyticsId);
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}`, 'ec-ga4');
  }

  if (analytics.facebookPixelId) {
    const fbq = function (...args: unknown[]) {
      (fbq as unknown as { queue: unknown[] }).queue.push(args);
    } as unknown as { (...args: unknown[]): void; queue: unknown[]; loaded?: boolean; version?: string };
    fbq.queue = [];
    window.fbq = fbq;
    if (!window.fbq.loaded) {
      const n = window.fbq as unknown as { (...args: unknown[]): void; queue: unknown[]; loaded?: boolean; version?: string };
      n.loaded = true;
      n.version = '2.0';
      loadScript('https://connect.facebook.net/en_US/fbevents.js', 'ec-fbpixel');
      window.fbq('init', analytics.facebookPixelId);
      window.fbq('track', 'PageView');
    }
  }
}

export function trackStoreGaEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.('event', name, params);
}

export function trackStoreMetaEvent(name: string, params?: Record<string, unknown>) {
  const map: Record<string, string> = {
    checkout_started: 'InitiateCheckout',
    purchase: 'Purchase',
    add_to_cart: 'AddToCart',
    product_view: 'ViewContent',
  };
  window.fbq?.('track', map[name] || name, params);
}

export function trackStoreCommerceEvent(
  event: string,
  analytics: StoreAnalyticsConfig | undefined,
  params?: Record<string, unknown>,
) {
  if (!analytics) return;
  trackStoreGaEvent(event, params);
  trackStoreMetaEvent(event, params);
}
