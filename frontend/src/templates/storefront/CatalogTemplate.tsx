import { useMemo, useState } from 'react';
import type { StorefrontProps } from './types';
import {
  TemplateShell,
  StoreBrandingHero,
  CodBadge,
  StickyBottomBar,
  PromoBanner,
  StoreContainer,
  StoreSection,
  StoreTrustAdvantages,
  StoreCategoryTiles,
  StoreWhyChooseUs,
  StoreReviewsSection,
  StoreFooter,
  CatalogToolbar,
  filterCatalogProducts,
  useCatalogFilters,
} from '@/components/storefront';
import { ProductGrid } from '@/components/storefront/product/ProductCard';

/** Template 3 — Multi-product catalog with search & filters */
export function CatalogTemplate(props: StorefrontProps) {
  const { slug, store, trust, products, delivery, intelligence } = props;
  const whatsapp = trust.whatsappSupport;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const { categories } = useCatalogFilters(products);
  const bestSellerIds = new Set(intelligence.bestSellers.map((p) => p.id));

  const filtered = useMemo(
    () => filterCatalogProducts(products, query, category, sort),
    [products, query, category, sort],
  );

  return (
    <TemplateShell theme={props.theme} whatsappUrl={whatsapp}>
      <StoreBrandingHero
        storeName={store.name}
        theme={store.theme}
        fallbackSubtitle={delivery.message}
        badge={<CodBadge />}
      />

      <StoreTrustAdvantages />

      <PromoBanner>
        {`Promo · Livraison COD · ${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}`}
      </PromoBanner>

      <StoreCategoryTiles
        categories={[...categories]}
        onCategoryClick={(cat) => {
          setCategory(cat);
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <StoreSection id="products-section">
        <StoreContainer className="space-y-4">
          <CatalogToolbar
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
            categories={categories}
            category={category}
            onCategoryChange={setCategory}
            resultCount={filtered.length}
          />
          <ProductGrid
            products={filtered}
            slug={slug}
            columns={4}
            variant="premium"
            badgeForProduct={(p) => (bestSellerIds.has(p.id) ? 'best-seller' : undefined)}
          />
        </StoreContainer>
      </StoreSection>

      <StoreWhyChooseUs />
      <StoreReviewsSection />

      <div id="store-contact">
        <StoreFooter storeName={store.name} slug={slug} whatsappUrl={whatsapp} />
      </div>
      <StickyBottomBar slug={slug} whatsappUrl={whatsapp} />
    </TemplateShell>
  );
}
