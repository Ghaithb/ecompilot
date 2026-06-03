import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Clock3, MessageCircle, ShieldCheck, Truck, Banknote } from 'lucide-react';
import type { StoreProduct } from '@/templates/storefront/types';
import { WHATSAPP_COLOR, DEFAULT_TESTIMONIALS } from './constants';
import { StoreContainer, StoreSection, StoreSectionHeader } from './layout';
import { BenefitsList, TestimonialsSection } from './content';

const ADVANTAGE_ICONS = {
  truck: Truck,
  cod: Banknote,
  whatsapp: MessageCircle,
} as const;

const ADVANTAGE_KEYS = [
  { icon: 'truck' as const, titleKey: 'fastDelivery', descKey: 'fastDeliveryDesc' },
  { icon: 'cod' as const, titleKey: 'codPayment', descKey: 'codPaymentDesc' },
  { icon: 'whatsapp' as const, titleKey: 'whatsappSupport', descKey: 'whatsappSupportDesc' },
];

function categoryTileStyle(name: string): CSSProperties {
  const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = (seed * 37) % 360;
  return {
    background: `linear-gradient(145deg, hsl(${hue} 55% 94%) 0%, hsl(${(hue + 40) % 360} 45% 88%) 100%)`,
  };
}

export function StoreTrustAdvantages() {
  const { t } = useTranslation();

  return (
    <section className="store-trust-advantages border-y bg-[var(--store-bg,#fff)]" aria-label={t('storefront.sections.advantagesAria')}>
      <StoreContainer>
        <div className="store-trust-advantages__grid grid gap-6 py-8 sm:grid-cols-3 sm:py-10">
          {ADVANTAGE_KEYS.map((item) => {
            const Icon = ADVANTAGE_ICONS[item.icon];
            return (
              <article key={item.titleKey} className="store-trust-advantage text-center sm:text-left">
                <div className="store-trust-advantage__icon mx-auto sm:mx-0">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-3 text-base font-semibold">{t(`storefront.sections.${item.titleKey}`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`storefront.sections.${item.descKey}`)}
                </p>
              </article>
            );
          })}
        </div>
      </StoreContainer>
    </section>
  );
}

export function StoreMarketProofStrip({
  productCount,
  deliveryLabel = '24-72h',
}: {
  productCount: number;
  deliveryLabel?: string;
}) {
  const { t } = useTranslation();
  const items = [
    {
      icon: ShieldCheck,
      label: t('storefront.sections.marketProofCod'),
      value: t('storefront.sections.marketProofCodValue'),
    },
    {
      icon: Clock3,
      label: t('storefront.sections.marketProofDelivery'),
      value: deliveryLabel,
    },
    {
      icon: BadgeCheck,
      label: t('storefront.sections.marketProofCatalog'),
      value: t('storefront.sections.marketProofCatalogValue', { count: productCount }),
    },
  ];

  return (
    <section className="store-market-proof border-b bg-background/95">
      <StoreContainer>
        <div className="grid gap-3 py-4 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--store-primary)]/10 text-[var(--store-primary)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</span>
                  <span className="block truncate text-sm font-semibold">{item.value}</span>
                </span>
              </div>
            );
          })}
        </div>
      </StoreContainer>
    </section>
  );
}

export function StoreCategoryTiles({
  categories,
  products = [],
  onCategoryClick,
}: {
  categories: string[];
  products?: StoreProduct[];
  onCategoryClick?: (category: string) => void;
}) {
  const { t } = useTranslation();
  const tiles = categories.filter((c) => c && c !== 'all').slice(0, 6);

  const covers = useMemo(() => {
    const map = new Map<string, { image?: string; count: number }>();
    for (const p of products) {
      const cat = p.category || t('storefront.sections.generalCategory');
      const prev = map.get(cat) || { count: 0 };
      map.set(cat, {
        count: prev.count + 1,
        image: prev.image || p.image || undefined,
      });
    }
    return map;
  }, [products, t]);

  if (!tiles.length) return null;

  return (
    <StoreSection spacing="default" className="store-category-section bg-muted/20">
      <StoreContainer>
        <StoreSectionHeader title={t('storefront.sections.categories')} subtitle={t('storefront.sections.categoriesSubtitle')} />
        <div className="store-category-tiles grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {tiles.map((cat) => {
            const cover = covers.get(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryClick?.(cat)}
                style={cover?.image ? undefined : categoryTileStyle(cat)}
                className="store-category-tile group relative min-h-[9rem] overflow-hidden rounded-2xl border border-black/5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:min-h-[10rem]"
              >
                {cover?.image ? (
                  <>
                    <img
                      src={cover.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" aria-hidden />
                  </>
                ) : (
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--store-primary)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                )}
                <span className="relative z-10 flex h-full flex-col justify-end p-4">
                  <span className={`block text-sm font-bold ${cover?.image ? 'text-white' : ''}`}>{cat}</span>
                  <span className={`mt-0.5 block text-xs ${cover?.image ? 'text-white/85' : 'text-muted-foreground'}`}>
                    {t('storefront.sections.articlesCount', { count: cover?.count ?? 0 })}
                  </span>
                  <span className={`mt-2 text-[11px] font-semibold ${cover?.image ? 'text-white/90' : 'text-[var(--store-primary)]'}`}>
                    {t('storefront.sections.viewProducts')} →
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </StoreContainer>
    </StoreSection>
  );
}

export function StoreWhyChooseUs() {
  const { t } = useTranslation();

  return (
    <StoreSection spacing="tight">
      <StoreContainer width="narrow">
        <StoreSectionHeader
          title={t('storefront.sections.whyChooseUs')}
          subtitle={t('storefront.sections.whyChooseUsSubtitle')}
          align="center"
        />
        <BenefitsList
          items={[
            t('storefront.sections.whyBenefit1'),
            t('storefront.sections.whyBenefit2'),
            t('storefront.sections.whyBenefit3'),
            t('storefront.sections.whyBenefit4'),
          ]}
        />
      </StoreContainer>
    </StoreSection>
  );
}

export function StoreReviewsSection() {
  const { t } = useTranslation();
  return <TestimonialsSection quotes={DEFAULT_TESTIMONIALS} title={t('storefront.sections.reviews')} />;
}

export function StoreFooter({
  storeName,
  slug,
  whatsappUrl,
}: {
  storeName: string;
  slug: string;
  whatsappUrl?: string;
}) {
  const { t } = useTranslation();

  return (
    <footer className="store-footer border-t bg-muted/30">
      <StoreContainer className="py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-semibold">{storeName}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t('storefront.sections.footerTagline')}</p>
          </div>
          <div>
            <p className="text-sm font-medium">{t('storefront.sections.navigation')}</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <Link to={`/store/${slug}`} className="hover:text-foreground">
                  {t('storefront.sections.home')}
                </Link>
              </li>
              <li>
                <a href="#products-section" className="hover:text-foreground">
                  {t('storefront.sections.shop')}
                </a>
              </li>
              <li>
                <Link to={`/store/${slug}/checkout`} className="hover:text-foreground">
                  {t('storefront.sections.orderCod')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">{t('storefront.sections.contact')}</p>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: WHATSAPP_COLOR }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
        <p className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {storeName} · {t('storefront.sections.poweredBy')}
        </p>
      </StoreContainer>
    </footer>
  );
}
