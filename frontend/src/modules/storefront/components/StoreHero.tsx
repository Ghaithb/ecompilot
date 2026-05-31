import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Truck } from 'lucide-react';
import type { DeliveryIntel, StoreProduct, StoreTrust } from '../types';
import { StoreTrustStrip } from './StoreTrustLayer';

export function StoreHero({
  slug,
  storeName,
  featured,
  delivery,
  trust,
  onShop,
  layout,
}: {
  slug: string;
  storeName: string;
  featured?: StoreProduct;
  delivery: DeliveryIntel;
  trust?: StoreTrust;
  onShop: () => void;
  layout?: string;
}) {
  const { t } = useTranslation();

  const heroShell =
    layout === 'catalog'
      ? 'from-orange-50 to-amber-50 border-orange-100'
      : layout === 'premium'
        ? 'from-slate-900 to-slate-800 border-slate-700 text-white'
        : layout === 'service'
          ? 'from-violet-50 to-pink-50 border-violet-100'
          : layout === 'product-focus'
            ? 'from-neutral-50 to-white border-neutral-200'
            : 'from-blue-50 to-indigo-50 border-blue-100';

  const ctaClass =
    layout === 'premium'
      ? 'bg-[var(--store-primary,#0f172a)]'
      : 'bg-[var(--store-primary,#2563eb)]';

  const titleClass = layout === 'premium' ? 'text-white' : '';
  const subClass = layout === 'premium' ? 'text-slate-300' : 'text-muted-foreground';

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 pb-2">
      <div className={`rounded-3xl border bg-gradient-to-br ${heroShell} p-6 sm:p-10 overflow-hidden relative`}>
        <div className="relative z-10 max-w-xl space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            {t('storefront.hero.deliveryCod', { label: delivery.estimatedLabel })}
          </p>
          <h1 className={`text-3xl sm:text-4xl font-semibold tracking-tight leading-tight ${titleClass}`}>
            {storeName}
          </h1>
          <p className={`text-sm sm:text-base ${subClass}`}>{delivery.message}</p>
          <StoreTrustStrip trust={trust} />
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onShop}
              className={`inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white hover:opacity-90 transition-opacity ${ctaClass}`}
            >
              {t('storefront.hero.orderNow')}
              <ArrowRight className="h-4 w-4" />
            </button>
            {featured && (
              <Link
                to={`/store/${slug}/product/${featured.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium hover:bg-muted"
              >
                {t('storefront.hero.viewProduct', {
                  title: featured.title.slice(0, 24) + (featured.title.length > 24 ? '…' : ''),
                })}
              </Link>
            )}
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            {t('storefront.hero.bestCarrier', { carrier: delivery.carrierLabel })}
          </p>
        </div>

        {featured?.image && (
          <div className="mt-6 sm:mt-0 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 sm:w-[40%] max-w-xs">
            <Link to={`/store/${slug}/product/${featured.id}`} className="block rounded-2xl overflow-hidden border shadow-lg">
              <img src={featured.image} alt={featured.title} className="w-full aspect-square object-cover" />
              <div className="p-3 bg-card flex justify-between items-center text-sm">
                <span className="font-medium truncate">{featured.title}</span>
                <span className="font-semibold shrink-0">{featured.price.toFixed(0)} TND</span>
              </div>
            </Link>
            <p className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Sparkles className="h-3.5 w-3.5" />
              {t('storefront.hero.featuredProduct')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
