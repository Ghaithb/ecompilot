import { Link } from 'react-router-dom';
import type { StorefrontProps } from './types';
import {
  TemplateShell,
  CTAButton,
  StickyBottomBar,
  StoreContainer,
  StoreSection,
  StoreSectionHeader,
  PremiumHero,
  StoreBrandingHero,
  StorySection,
  StoreTrustAdvantages,
  StoreWhyChooseUs,
  StoreReviewsSection,
  StoreFooter,
} from '@/components/storefront';
import { ProductGrid } from '@/components/storefront/product/ProductCard';

/** Template 4 — Premium brand · fashion · storytelling */
export function PremiumBrandTemplate(props: StorefrontProps) {
  const { slug, store, trust, products, featured, delivery, intelligence } = props;
  const whatsapp = trust.whatsappSupport;
  const hasBranding = Boolean(store.theme?.coverImage || store.theme?.slogan || store.theme?.logo);
  const bestSellerIds = new Set(intelligence.bestSellers.map((p) => p.id));
  const heroProduct = featured || intelligence.bestSellers[0] || products[0];

  return (
    <TemplateShell theme={props.theme} whatsappUrl={whatsapp}>
      {hasBranding ? (
        <StoreBrandingHero storeName={store.name} theme={store.theme} fallbackSubtitle={delivery.message}>
          <CTAButton href={`/store/${slug}/checkout`}>Acheter · COD</CTAButton>
          {heroProduct && (
            <Link
              to={`/store/${slug}/product/${heroProduct.id}`}
              className="store-btn inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Découvrir
            </Link>
          )}
        </StoreBrandingHero>
      ) : heroProduct?.image ? (
        <PremiumHero
          image={heroProduct.image}
          title={store.name}
          subtitle={delivery.message}
        >
          <CTAButton href={`/store/${slug}/checkout`}>Acheter · COD</CTAButton>
          <Link
            to={`/store/${slug}/product/${heroProduct.id}`}
            className="store-btn inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Découvrir
          </Link>
        </PremiumHero>
      ) : (
        <StoreSection>
          <StoreContainer className="py-8 text-center">
            <h1 className="store-display">{store.name}</h1>
          </StoreContainer>
        </StoreSection>
      )}

      <StoreTrustAdvantages />

      <StorySection
        body={`${trust.codTrust.headline}. ${trust.merchantName || store.name} sélectionne des pièces uniques pour la Tunisie — livraison soignée, paiement à la réception, zéro compromis sur la qualité.`}
      />

      <StoreSection spacing="tight">
        <StoreContainer>
          <StoreSectionHeader title="Lookbook" subtitle="Sélection premium · paiement à la livraison" align="center" />
          <ProductGrid
            products={products.slice(0, 8)}
            slug={slug}
            columns={2}
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

      <StickyBottomBar slug={slug} whatsappUrl={whatsapp} codLabel="Acheter · COD" />
    </TemplateShell>
  );
}
