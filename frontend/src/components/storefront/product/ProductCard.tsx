import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Package, Star } from 'lucide-react';
import { useStorefront } from '@/modules/storefront/context/StorefrontContext';
import type { StoreProduct } from '@/templates/storefront/types';
import { StorePrice, CTAButton } from '../design-system/commerce';
import { ProductQuickViewModal } from './ProductQuickViewModal';

export type ProductBadgeType = 'best-seller' | 'new' | 'promo';

const BADGE_KEYS: Record<ProductBadgeType, string> = {
  'best-seller': 'badgeBestSeller',
  new: 'badgeNew',
  promo: 'badgePromo',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Mode: 'from-rose-400/80 to-orange-300/80',
  Tech: 'from-violet-500/80 to-indigo-400/80',
  Maison: 'from-emerald-400/80 to-teal-300/80',
  Beauté: 'from-pink-400/80 to-fuchsia-300/80',
  Sport: 'from-sky-500/80 to-cyan-400/80',
};

function socialProof(productId: string) {
  const seed = productId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rating = 4 + (seed % 10) / 10;
  const reviews = 8 + (seed % 45);
  return { rating: Math.min(rating, 5), reviews };
}

function StarRating({ rating }: { rating: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1" aria-label={t('storefront.sections.ratingAria', { rating: rating.toFixed(1) })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function StorefrontProductCard({
  product,
  slug,
  large,
  variant = 'premium',
  badge,
}: {
  product: StoreProduct;
  slug: string;
  large?: boolean;
  variant?: 'default' | 'premium' | 'minimal';
  badge?: ProductBadgeType;
}) {
  const { addItem } = useStorefront();
  const { t } = useTranslation();
  const { rating, reviews } = socialProof(product.id);
  const isPremium = variant === 'premium' || variant === 'default';
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(product.image) && !imageFailed;
  const categoryGradient = CATEGORY_GRADIENTS[product.category || ''] || 'from-slate-400/80 to-slate-500/80';

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
  };

  const cardClass = isPremium
    ? 'store-product-card store-product-card--premium'
    : variant === 'minimal'
      ? 'store-product-card store-product-card--minimal'
      : 'store-product-card';

  return (
    <>
      <article className={`${cardClass} ${large ? 'sm:col-span-2' : ''}`}>
        <div className="store-product-card__inner group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div
            className={`store-product-media relative overflow-hidden bg-muted ${large ? 'aspect-[4/3]' : 'aspect-square'}`}
          >
            <Link to={`/store/${slug}/product/${product.id}`} className="block h-full">
              {showImage ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className={`flex h-full flex-col items-center justify-center bg-gradient-to-br ${categoryGradient} p-4 text-center`}>
                  <Package className="h-10 w-10 text-white/90" aria-hidden />
                  {product.category ? (
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/90">{product.category}</span>
                  ) : null}
                </div>
              )}
            </Link>

            {badge && (
              <span className={`store-product-badge store-product-badge--${badge}`}>
                {t(`storefront.sections.${BADGE_KEYS[badge]}`)}
              </span>
            )}

            {!product.inStock && (
              <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white">
                {t('store.outOfStock')}
              </span>
            )}

            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="store-product-quickview absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100"
              aria-label={`${t('storefront.sections.quickView')} — ${product.title}`}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-lg">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {t('storefront.sections.quickView')}
              </span>
            </button>
          </div>

        <div className="store-product-body bg-white p-4">
          <Link to={`/store/${slug}/product/${product.id}`} className="block no-underline">
            <h3 className={`store-product-title font-semibold text-foreground ${large ? 'text-base' : 'text-sm line-clamp-2'}`}>
              {product.title}
            </h3>
          </Link>

          {product.category && (
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.category}</p>
          )}

          {isPremium && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
          )}

          <div className="mt-3">
            <StorePrice amount={product.price} size={isPremium ? 'lg' : 'md'} suffix="DT" />
          </div>

          {isPremium ? (
            <div className="mt-4 flex flex-col gap-2">
              <CTAButton href={`/store/${slug}/checkout`} className="w-full text-xs sm:text-sm">
                {t('storefront.sections.orderCodBtn')}
              </CTAButton>
              <button
                type="button"
                onClick={handleAdd}
                className="store-product-add-secondary w-full rounded-full border py-2 text-xs font-semibold transition-colors hover:bg-muted"
              >
                {t('storefront.sections.addToCart')}
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between gap-2">
              <StorePrice amount={product.price} />
              <button
                type="button"
                onClick={handleAdd}
                className="store-product-add inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                aria-label={`${t('storefront.sections.addToCart')} — ${product.title}`}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
      <ProductQuickViewModal
        product={product}
        slug={slug}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}

export function ProductGrid({
  products,
  slug,
  columns = 3,
  variant = 'premium',
  badge,
  badgeForProduct,
}: {
  products: StoreProduct[];
  slug: string;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'premium' | 'minimal';
  badge?: ProductBadgeType;
  badgeForProduct?: (product: StoreProduct, index: number) => ProductBadgeType | undefined;
}) {
  if (!products.length) return null;

  const colClass =
    products.length === 1
      ? 'grid-cols-1 max-w-sm mx-auto'
      : columns === 4
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'
        : columns === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4';

  return (
    <div className={`store-product-grid grid gap-4 sm:gap-5 ${colClass}`} role="list">
      {products.map((p, i) => (
        <StorefrontProductCard
          key={p.id}
          product={p}
          slug={slug}
          variant={variant}
          badge={badgeForProduct?.(p, i) ?? badge}
        />
      ))}
    </div>
  );
}

export function ProductSectionBlock({
  title,
  subtitle,
  products,
  slug,
  variant = 'premium',
  badge,
  badgeForProduct,
}: {
  title: string;
  subtitle?: string;
  products: StoreProduct[];
  slug: string;
  variant?: 'default' | 'premium' | 'minimal';
  badge?: ProductBadgeType;
  badgeForProduct?: (product: StoreProduct, index: number) => ProductBadgeType | undefined;
}) {
  if (!products.length) return null;
  return (
    <section className="store-section py-6 sm:py-8" aria-labelledby={title ? `section-${title.replace(/\s+/g, '-')}` : undefined}>
      <div className="mx-auto w-full max-w-[var(--store-max,90rem)] px-[var(--store-gutter,1.25rem)]">
        {title ? (
          <header className="mb-5 sm:mb-6">
            <h2 id={`section-${title.replace(/\s+/g, '-')}`} className="store-section-title">
              {title}
            </h2>
            {subtitle && <p className="store-section-subtitle mt-1.5">{subtitle}</p>}
          </header>
        ) : null}
        <ProductGrid
          products={products}
          slug={slug}
          variant={variant}
          badge={badge}
          badgeForProduct={badgeForProduct}
        />
      </div>
    </section>
  );
}
