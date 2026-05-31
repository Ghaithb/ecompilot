import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { ProductCard } from './ProductCard';
import { StoreTrustStrip } from './StoreTrustLayer';

export function StoreCartDrawer() {
  const { t } = useTranslation();
  const {
    slug,
    items,
    preview,
    cartOpen,
    setCartOpen,
    updateQty,
    removeItem,
    subtotal,
    itemCount,
  } = useStorefront();

  if (!cartOpen) return null;

  const threshold = preview?.freeShipping;
  const upsells = preview?.upsells || [];

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} aria-label={t('storefront.close')} />
      <div className="absolute bottom-0 sm:top-0 sm:right-0 sm:bottom-auto h-[90vh] sm:h-full w-full sm:max-w-md bg-background border-l shadow-xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b px-4 h-14 shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="h-4 w-4" />
            {t('storefront.cart')} ({itemCount})
          </div>
          <button type="button" onClick={() => setCartOpen(false)} className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!items.length ? (
            <p className="text-sm text-muted-foreground text-center py-12">{t('store.emptyCart')}</p>
          ) : (
            <>
              {threshold && (
                <div className="rounded-xl border p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{threshold.unlocked ? t('store.freeShipping') : t('store.freeShippingRemainingShort', { amount: `${threshold.remaining.toFixed(0)} TND` })}</span>
                    <span className="text-muted-foreground">{threshold.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${threshold.progress}%` }} />
                  </div>
                </div>
              )}

              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    {item.image && (
                      <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover border shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-sm tabular-nums text-muted-foreground">{(item.price * item.quantity).toFixed(0)} TND</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button type="button" className="h-7 w-7 rounded-full border inline-flex items-center justify-center" onClick={() => updateQty(item.productId, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-6 text-center tabular-nums">{item.quantity}</span>
                        <button type="button" className="h-7 w-7 rounded-full border inline-flex items-center justify-center" onClick={() => updateQty(item.productId, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <button type="button" className="ml-auto text-xs text-red-600" onClick={() => removeItem(item.productId)}>
                          {t('storefront.remove')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {preview?.shippingPreview && (
                <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
                  {t('storefront.shippingEstimate', {
                    cost: preview.shippingPreview.estimatedCost.toFixed(0),
                    days: preview.shippingPreview.estimatedDays,
                    provider: preview.shippingPreview.provider,
                  })}
                </p>
              )}

              {preview?.trust && <StoreTrustStrip trust={preview.trust} />}

              {upsells.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t('storefront.addAlso')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {upsells.map((u) => (
                      <ProductCard key={u.id} product={u} slug={slug} compact />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 shrink-0 pb-safe">
            <div className="flex justify-between text-sm">
              <span>{t('store.subtotal')}</span>
              <span className="font-semibold tabular-nums">{(preview?.totals?.total ?? subtotal).toFixed(0)} TND</span>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">{t('storefront.codPaymentNote')}</p>
            <Link
              to={`/store/${slug}/checkout`}
              onClick={() => setCartOpen(false)}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              {t('storefront.placeOrderCod')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function FloatingCheckoutBar() {
  const { t } = useTranslation();
  const { slug, itemCount, subtotal, preview, setCartOpen } = useStorefront();
  if (!itemCount) return null;

  const total = preview?.totals?.total ?? subtotal;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur p-3 sm:hidden pb-safe">
      <div className="flex gap-2 max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="flex-1 h-12 rounded-full border text-sm font-medium"
        >
          {t('storefront.cartCount', { count: itemCount })}
        </button>
        <Link
          to={`/store/${slug}/checkout`}
          className="flex-[1.4] h-12 inline-flex items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        >
          {t('storefront.codShort', { amount: total.toFixed(0) })}
        </Link>
      </div>
    </div>
  );
}
