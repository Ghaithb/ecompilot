import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Minus, Plus, Zap } from 'lucide-react';
import { fetchStoreProduct } from '../api/storefrontApi';
import { useStorefront } from '../context/StorefrontContext';
import { StorefrontLayout } from '../components/StorefrontHeader';
import { DeliveryIntelBadge, ProductSection } from '../components/ProductCard';
import { StoreCartDrawer } from '../components/StoreCartDrawer';
import { StoreTrustStrip } from '../components/StoreTrustLayer';

export function StorefrontProductPage() {
  const { t } = useTranslation();
  const { slug = '', productId = '' } = useParams();
  const { addItem, viewProduct, slug: ctxSlug } = useStorefront();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['storefront-product', slug, productId],
    queryFn: () => fetchStoreProduct(slug, productId),
    enabled: Boolean(slug && productId),
  });

  useEffect(() => {
    if (productId) viewProduct(productId);
  }, [productId, viewProduct]);

  const handleAdd = async () => {
    if (!data?.product) return;
    setAdding(true);
    try {
      await addItem({
        productId: data.product.id,
        name: data.product.title,
        price: data.product.price,
        quantity: qty,
        image: data.product.image,
      });
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <p>{t('storefront.product.notFound')}</p>
        <Link to={`/store/${slug}`} className="text-primary text-sm mt-2 inline-block">{t('storefront.product.backToStore')}</Link>
      </div>
    );
  }

  const { product, related, upsells, delivery, trust, urgency } = data;

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link to={`/store/${ctxSlug || slug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          {t('storefront.product.back')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl overflow-hidden border bg-muted aspect-square max-h-[70vh]">
            {product.image ? (
              <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="space-y-5 pb-28 lg:pb-0">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">{product.title}</h1>
              <p className="text-2xl font-bold tabular-nums mt-3">{product.price.toFixed(0)} TND</p>
            </div>

            <DeliveryIntelBadge delivery={delivery} />

            {(urgency?.popular || urgency?.deliveryPromise) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-900 space-y-1">
                {urgency.popular && (
                  <p className="inline-flex items-center gap-1 font-medium">
                    <Zap className="h-4 w-4" />
                    {t('storefront.product.highDemand')}
                  </p>
                )}
                {urgency.deliveryPromise && <p className="text-xs">{urgency.deliveryPromise}</p>}
              </div>
            )}

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <StoreTrustStrip trust={trust} />

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border">
                <button type="button" className="h-10 w-10 inline-flex items-center justify-center" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center tabular-nums text-sm">{qty}</span>
                <button type="button" className="h-10 w-10 inline-flex items-center justify-center" onClick={() => setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                disabled={!product.inStock || adding}
                onClick={handleAdd}
                className="flex-1 h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {t('storefront.product.addCod')}
              </button>
            </div>

            <Link
              to={`/store/${slug}/checkout`}
              className="block text-center text-sm font-medium text-primary hover:underline"
            >
              {t('storefront.product.checkoutExpress')}
            </Link>
          </div>
        </div>

        {upsells?.length > 0 && (
          <div className="mt-10">
            <ProductSection title={t('storefront.product.completeOrder')} products={upsells} slug={slug} />
          </div>
        )}

        {related?.length > 0 && (
          <ProductSection title={t('storefront.product.similarProducts')} products={related} slug={slug} />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 border-t bg-background/95 backdrop-blur p-3 lg:hidden pb-safe">
        <button
          type="button"
          disabled={!product.inStock || adding}
          onClick={handleAdd}
          className="w-full h-12 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        >
          {t('storefront.product.addToCartMobile', { amount: product.price.toFixed(0) })}
        </button>
      </div>

      <StoreCartDrawer />
    </StorefrontLayout>
  );
}
