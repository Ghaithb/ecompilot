import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/apiConfig';
import { WHATSAPP_COLOR } from '@/components/storefront/design-system/constants';
import { useStorefront } from '../context/StorefrontContext';
import { buildStoreThemeStyle, getStoreLayoutClass } from '@/components/storefront/design-system/theme';

const NAV_LINKS = [
  { label: 'Accueil', href: (slug: string) => `/store/${slug}` },
  { label: 'Boutique', href: () => '#products-section' },
  { label: 'Promotions', href: () => '#products-section' },
  { label: 'Contact', href: () => '#store-contact' },
] as const;

export function StorefrontHeader() {
  const { t } = useTranslation();
  const { slug, store, itemCount, setCartOpen } = useStorefront();
  const name = store?.store.name || t('storefront.shopDefault');
  const logoSrc = store?.store.theme?.logo ? resolveUploadUrl(store.store.theme.logo) : undefined;
  const whatsapp = store?.trust.whatsappSupport;

  return (
    <header className="store-header-wave sticky top-0 z-40 bg-white shadow-sm dark:bg-background">
      <div className="mx-auto max-w-[var(--store-max,90rem)] px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to={`/store/${slug}`}
            className="store-header-brand flex min-w-0 shrink-0 items-center gap-3 no-underline"
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt=""
                className="store-header-logo h-12 w-12 shrink-0 rounded-xl object-contain sm:h-14 sm:w-14"
              />
            ) : (
              <span className="store-header-logo-fallback flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--store-primary)] text-lg font-bold text-white sm:h-14 sm:w-14">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="store-header-name truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
              {name}
            </span>
          </Link>

          <nav
            className="store-header-nav hidden flex-1 items-center justify-center gap-6 md:flex"
            aria-label="Navigation boutique"
          >
            {NAV_LINKS.map((item) => {
              const to = item.href(slug);
              const isHash = to.startsWith('#');
              const className =
                'text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--store-primary)]';
              if (isHash) {
                return (
                  <a key={item.label} href={to} className={className}>
                    {item.label}
                  </a>
                );
              }
              return (
                <Link key={item.label} to={to} className={className}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {whatsapp && whatsapp !== '#' ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="store-header-whatsapp hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02] sm:inline-flex"
                style={{ backgroundColor: WHATSAPP_COLOR }}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="store-header-cart relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
              aria-label={t('storefront.cart')}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--store-primary,#2563eb)]">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav className="store-header-nav-mobile flex gap-1 overflow-x-auto border-t py-2 md:hidden" aria-label="Navigation mobile">
          {NAV_LINKS.map((item) => {
            const to = item.href(slug);
            const className =
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted';
            if (to.startsWith('#')) {
              return (
                <a key={item.label} href={to} className={className}>
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={item.label} to={to} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {store?.trust && (
        <div className="store-trust-bar border-t bg-muted/40 px-4 py-2 overflow-x-auto">
          <div className="mx-auto max-w-6xl flex gap-4 text-[10px] text-muted-foreground whitespace-nowrap sm:text-xs">
            {store.trust.badges.slice(0, 4).map((b) => (
              <span key={b.id} className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 shrink-0 text-[var(--store-primary)]" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { store } = useStorefront();
  const theme = store?.store.theme;
  const layout = store?.templateLayout;

  return (
    <div
      className={`storefront-root min-h-screen pb-24 sm:pb-8 ${getStoreLayoutClass(layout)}`}
      style={{
        ...buildStoreThemeStyle(theme),
        backgroundColor: theme?.backgroundColor ? 'var(--store-bg)' : undefined,
        color: theme?.textColor ? 'var(--store-text)' : undefined,
      }}
    >
      <StorefrontHeader />
      <main>{children}</main>
    </div>
  );
}

