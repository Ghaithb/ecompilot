import { Calendar, MessageCircle } from 'lucide-react';
import type { StoreProduct, StorefrontProps } from './types';
import {
  TemplateShell,
  StoreBrandingHero,
  CTAButton,
  WhatsAppLink,
  StickyBottomBar,
  StoreContainer,
  StoreSection,
  StoreSectionHeader,
  StorePrice,
  StoreTrustAdvantages,
  StoreReviewsSection,
  StoreFooter,
  SERVICE_PACKAGES,
  WHATSAPP_COLOR,
} from '@/components/storefront';

function ServiceCard({
  item,
  slug,
  whatsapp,
}: {
  item: StoreProduct;
  slug: string;
  whatsapp?: string;
}) {
  return (
    <article className="store-service-card rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="font-semibold">{item.title}</h3>
      {item.description && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
      <p className="mt-3">
        <StorePrice amount={item.price} />
      </p>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="store-btn mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: WHATSAPP_COLOR }}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Réserver
        </a>
      ) : (
        <CTAButton href={`/store/${slug}/checkout`} className="mt-4 w-full text-xs">
          Réserver
        </CTAButton>
      )}
    </article>
  );
}

/** Template 5 — Services · salons · booking via WhatsApp */
export function ServiceBookingTemplate(props: StorefrontProps) {
  const { slug, store, trust, products, delivery } = props;
  const whatsapp = trust.whatsappSupport;

  const services: StoreProduct[] = products.length
    ? products
    : SERVICE_PACKAGES.map((p, i) => ({
        id: `pkg-${i}`,
        title: p.name,
        description: p.desc,
        price: p.price,
        image: '',
        category: 'Service',
        inStock: true,
      }));

  return (
    <TemplateShell theme={props.theme} whatsappUrl={whatsapp}>
      <StoreBrandingHero
        storeName={store.name}
        theme={store.theme}
        fallbackSubtitle="Réservez votre créneau · confirmation WhatsApp · COD disponible"
        variant="service"
      >
        <WhatsAppLink href={whatsapp} label="Réserver sur WhatsApp" />
        <CTAButton href={`/store/${slug}/checkout`} variant="outline">
          Voir offres
        </CTAButton>
      </StoreBrandingHero>

      <StoreTrustAdvantages />

      <StoreSection>
        <StoreContainer>
          <StoreSectionHeader title="Nos services" subtitle="Choisissez votre formule · paiement à la livraison" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => (
              <ServiceCard key={item.id} item={item} slug={slug} whatsapp={whatsapp} />
            ))}
          </div>
        </StoreContainer>
      </StoreSection>

      <StoreSection spacing="tight">
        <StoreContainer width="narrow">
          <div className="store-booking-cta rounded-2xl border border-dashed p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-[var(--store-primary)]" aria-hidden />
            <h3 className="mt-3 font-semibold">Disponibilités</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Contactez-nous sur WhatsApp pour choisir votre créneau · {delivery.estimatedLabel}
            </p>
            <WhatsAppLink href={whatsapp} label="Choisir un horaire" className="mx-auto mt-4" />
          </div>
        </StoreContainer>
      </StoreSection>

      <StoreReviewsSection />

      <div id="store-contact">
        <StoreFooter storeName={store.name} slug={slug} whatsappUrl={whatsapp} />
      </div>

      <StickyBottomBar slug={slug} whatsappUrl={whatsapp} codLabel="Réserver" whatsappLabel="WhatsApp" />
    </TemplateShell>
  );
}
