import type { StorefrontProps } from './types';
import {
  TemplateShell,
  StoreBrandingHero,
  CTAButton,
  CodBadge,
  WhatsAppLink,
  StickyBottomBar,
  StoreContainer,
  StoreSection,
  StoreEmptyState,
  StorePrice,
  BenefitsList,
  FAQSection,
  StoreTrustAdvantages,
  StoreReviewsSection,
  StoreFooter,
  COD_BENEFITS,
  COD_FAQ,
} from '@/components/storefront';
import { StorefrontProductCard } from '@/components/storefront/product/ProductCard';

/** Template 2 — Single product landing · Facebook/IG ads */
export function ProductFocusTemplate(props: StorefrontProps) {
  const { slug, store, trust, featured, products, intelligence } = props;
  const product = featured || products[0] || intelligence.bestSellers[0];
  const whatsapp = trust.whatsappSupport;
  const hasBranding = Boolean(store.theme?.coverImage || store.theme?.slogan || store.theme?.logo);

  if (!product) {
    return (
      <TemplateShell theme={props.theme} whatsappUrl={whatsapp}>
        <StoreEmptyState message="Aucun produit disponible pour le moment." />
      </TemplateShell>
    );
  }

  return (
    <TemplateShell theme={props.theme} whatsappUrl={whatsapp}>
      {hasBranding ? (
        <StoreBrandingHero storeName={store.name} theme={store.theme} variant="minimal" />
      ) : null}

      <StoreTrustAdvantages />

      <StoreSection spacing="tight">
        <StoreContainer width="narrow" className="space-y-6">
          <div className="flex justify-center">
            <CodBadge />
          </div>

          <div className="store-product-media aspect-square overflow-hidden rounded-[var(--store-radius-lg)] border bg-muted">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : null}
          </div>

          <div className="space-y-2 text-center">
            <h1 className="store-hero-title text-2xl">{product.title}</h1>
            <StorePrice amount={product.price} size="lg" />
            <p className="text-xs text-muted-foreground">Paiement à la livraison · {store.name}</p>
          </div>

          <BenefitsList items={COD_BENEFITS} />

          <div className="flex flex-col gap-3">
            <CTAButton href={`/store/${slug}/checkout`} className="w-full" size="lg">
              Commander maintenant (COD)
            </CTAButton>
            <WhatsAppLink href={whatsapp} label="Commander via WhatsApp" className="w-full justify-center" />
          </div>
        </StoreContainer>
      </StoreSection>

      <StoreReviewsSection />
      <FAQSection items={COD_FAQ} />

      <StoreSection spacing="tight">
        <StoreContainer width="narrow">
          <StorefrontProductCard product={product} slug={slug} large variant="premium" badge="new" />
        </StoreContainer>
      </StoreSection>

      <div id="store-contact">
        <StoreFooter storeName={store.name} slug={slug} whatsappUrl={whatsapp} />
      </div>

      <StickyBottomBar slug={slug} whatsappUrl={whatsapp} />
    </TemplateShell>
  );
}
