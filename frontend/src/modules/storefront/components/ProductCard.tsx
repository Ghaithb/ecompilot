import { Link } from 'react-router-dom';
import { Clock, Package, Plus, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DeliveryIntel, StoreProduct } from '../types';
import { useStorefront } from '../context/StorefrontContext';

export function DeliveryIntelBadge({ delivery }: { delivery: DeliveryIntel }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 px-2.5 py-1 font-medium">
        <Truck className="h-3.5 w-3.5" />
        {delivery.estimatedLabel}
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Confiance {delivery.deliveryConfidence}%
      </span>
      <span>{delivery.carrierLabel}</span>
    </div>
  );
}

export function ProductCard({
  product,
  slug,
  compact,
  onAdd,
}: {
  product: StoreProduct;
  slug: string;
  compact?: boolean;
  onAdd?: () => void;
}) {
  const { addItem } = useStorefront();
  const { t } = useTranslation();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    onAdd?.();
  };

  return (
    <Link
      to={`/store/${slug}/product/${product.id}`}
      className={`group block rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow ${compact ? '' : ''}`}
    >
      <div className="aspect-square bg-muted overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {!product.inStock && (
          <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
            {t('store.outOfStock')}
          </span>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium line-clamp-2 leading-snug">{product.title}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold tabular-nums">{product.price.toFixed(0)} TND</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            aria-label={t('store.addAria')}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export function ProductSection({
  title,
  subtitle,
  products,
  slug,
}: {
  title: string;
  subtitle?: string;
  products: StoreProduct[];
  slug: string;
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} slug={slug} />
        ))}
      </div>
    </section>
  );
}
