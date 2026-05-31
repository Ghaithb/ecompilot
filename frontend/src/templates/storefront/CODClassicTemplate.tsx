import { useMemo, useState } from 'react';
import type { StorefrontProps } from './types';
import { useTranslation } from 'react-i18next';
import {
  TemplateShell,
  StoreBrandingHero,
  CTAButton,
  CodBadge,
  StickyBottomBar,
  WhatsAppLink,
  StoreTrustAdvantages,
  StoreCategoryTiles,
  StoreWhyChooseUs,
  StoreReviewsSection,
  StoreFooter,
} from '@/components/storefront';
import { ProductSectionBlock, ProductGrid } from '@/components/storefront/product/ProductCard';
import { CatalogToolbar, filterCatalogProducts, useCatalogFilters } from '@/components/storefront/design-system/catalog';

const TRENDING_LIMIT = 4;

/** Template 1 — General COD store · maximum conversion */
export function CODClassicTemplate(props: StorefrontProps) {
  const { t } = useTranslation();
  const { slug, store, trust, delivery, intelligence, recentlyViewed, products, featured: featuredProp, onScrollToProducts } = props;
  const whatsapp = trust.whatsappSupport;
  const { categories } = useCatalogFilters(products);
  const catalogIds = new Set(products.map((p) => p.id));

  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogSort, setCatalogSort] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  const trending = intelligence.trending.filter((p) => catalogIds.has(p.id)).slice(0, TRENDING_LIMIT);
  const bestSellers = intelligence.bestSellers.filter((p) => catalogIds.has(p.id));
  const bestSellerIds = new Set(bestSellers.map((p) => p.id));
  const trendingIds = new Set(trending.map((p) => p.id));

  const featured =
    (featuredProp && catalogIds.has(featuredProp.id) ? featuredProp : undefined) ||
    bestSellers[0] ||
    trending[0] ||
    products[0];

  const showFeatured =
    featured && !trending.some((p) => p.id === featured.id) && !bestSellers.some((p) => p.id === featured.id);

  const sameTrendingAndBestSellers =
    trending.length > 0 &&
    trending.length === bestSellers.length &&
    trending.every((p, i) => p.id === bestSellers[i]?.id);

  const catalogProducts = useMemo(
    () => filterCatalogProducts(products, catalogQuery, catalogCategory, catalogSort),
    [products, catalogQuery, catalogCategory, catalogSort],
  );

  const scrollToProducts = () => {
    onScrollToProducts?.();
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCatalog = (category?: string) => {
    if (category) setCatalogCategory(category);
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <TemplateShell theme={props.theme} whatsappUrl={whatsapp}>
      <StoreBrandingHero
        storeName={store.name}
        theme={store.theme}
        fallbackSubtitle={delivery.message}
        badge={<CodBadge />}
      >
        <CTAButton onClick={scrollToProducts}>{t('storefront.sections.viewProductsHero')}</CTAButton>
        <WhatsAppLink href={whatsapp} label="WhatsApp" />
      </StoreBrandingHero>

      <StoreTrustAdvantages />

      <StoreCategoryTiles
        categories={[...categories]}
        products={products}
        onCategoryClick={(cat) => scrollToCatalog(cat)}
      />

      {showFeatured && featured && (
        <ProductSectionBlock
          title={t('storefront.sections.featured')}
          subtitle={t('storefront.sections.featuredSubtitle')}
          products={[featured]}
          slug={slug}
          badge="best-seller"
        />
      )}

      <div id="products-section">
        {sameTrendingAndBestSellers ? (
          trending.length > 0 && (
            <ProductSectionBlock
              title={t('storefront.sections.trending')}
              subtitle={t('storefront.sections.trendingSubtitle')}
              products={trending}
              slug={slug}
              badge="new"
            />
          )
        ) : (
          <>
            {trending.length > 0 && (
              <ProductSectionBlock
                title={t('storefront.sections.trending')}
                subtitle={t('storefront.sections.trendingSubtitle')}
                products={trending}
                slug={slug}
                badgeForProduct={(p) => (trendingIds.has(p.id) ? 'new' : undefined)}
              />
            )}
            {bestSellers.length > 0 && (
              <ProductSectionBlock
                title={t('storefront.sections.bestSellers')}
                subtitle={t('storefront.sections.bestSellersSubtitle')}
                products={bestSellers.filter((p) => !trendingIds.has(p.id)).slice(0, TRENDING_LIMIT)}
                slug={slug}
                badgeForProduct={(p) => (bestSellerIds.has(p.id) ? 'best-seller' : undefined)}
              />
            )}
          </>
        )}
      </div>

      <section id="catalog-section" className="store-section py-8 sm:py-10 bg-muted/15 border-y">
        <div className="mx-auto w-full max-w-[var(--store-max,90rem)] px-[var(--store-gutter,1.25rem)]">
          <header className="mb-6 max-w-2xl">
            <h2 className="store-section-title">{t('storefront.sections.allProducts')}</h2>
            <p className="store-section-subtitle mt-1.5">{t('storefront.sections.allProductsSubtitle', { count: products.length })}</p>
          </header>
          <CatalogToolbar
            query={catalogQuery}
            onQueryChange={setCatalogQuery}
            sort={catalogSort}
            onSortChange={setCatalogSort}
            categories={categories}
            category={catalogCategory}
            onCategoryChange={setCatalogCategory}
            resultCount={catalogProducts.length}
          />
          <div className="mt-6">
            {catalogProducts.length > 0 ? (
              <ProductGrid products={catalogProducts} slug={slug} columns={4} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">{t('storefront.sections.noResults')}</p>
            )}
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <ProductSectionBlock title={t('storefront.sections.recentlyViewed')} products={recentlyViewed} slug={slug} />
      )}

      <StoreWhyChooseUs />
      <StoreReviewsSection />

      <div id="store-contact">
        <StoreFooter storeName={store.name} slug={slug} whatsappUrl={whatsapp} />
      </div>

      <StickyBottomBar slug={slug} whatsappUrl={whatsapp} />
    </TemplateShell>
  );
}
