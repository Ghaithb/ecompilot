import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/apiConfig';
import { WHATSAPP_COLOR } from './constants';
import { StoreContainer, StoreSection } from './layout';

const btnBase =
  'store-btn inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)] focus-visible:ring-offset-2';

export function CTAButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  size = 'md',
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'whatsapp';
  className?: string;
  size?: 'md' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'h-12 px-8 text-base' : '';
  const styles =
    variant === 'whatsapp'
      ? 'text-white'
      : variant === 'outline'
        ? 'store-btn-outline bg-transparent'
        : variant === 'ghost'
          ? 'border border-white/30 text-white hover:bg-white/10'
          : 'store-btn-primary text-white';

  const style = variant === 'whatsapp' ? { backgroundColor: WHATSAPP_COLOR } : undefined;

  if (href) {
    return (
      <Link to={href} className={`${btnBase} ${styles} ${sizeClass} ${className}`} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${btnBase} ${styles} ${sizeClass} ${className}`} style={style}>
      {children}
    </button>
  );
}

export function WhatsAppFloatingButton({ href }: { href?: string }) {
  if (!href || href === '#') return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="store-whatsapp-float fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:bottom-6"
      style={{ backgroundColor: WHATSAPP_COLOR }}
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}

export function WhatsAppLink({
  href,
  label,
  className = '',
}: {
  href?: string;
  label: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${btnBase} text-white ${className}`}
      style={{ backgroundColor: WHATSAPP_COLOR }}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}

export function StickyBottomBar({
  slug,
  whatsappUrl,
  codLabel = 'Commander COD',
  whatsappLabel = 'WhatsApp',
}: {
  slug: string;
  whatsappUrl?: string;
  codLabel?: string;
  whatsappLabel?: string;
}) {
  return (
    <div
      className="store-sticky-cta fixed inset-x-0 bottom-0 z-30 border-t bg-[var(--store-bg,#fff)]/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--store-bg,#fff)]/80 sm:hidden"
      role="region"
      aria-label="Actions rapides commande"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <CTAButton href={`/store/${slug}/checkout`} className="flex-1 px-3 text-xs">
          {codLabel}
        </CTAButton>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="store-btn flex flex-1 items-center justify-center gap-1 rounded-full px-3 text-xs font-semibold text-white"
            style={{ backgroundColor: WHATSAPP_COLOR }}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {whatsappLabel}
          </a>
        )}
      </div>
    </div>
  );
}

export function CodBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`store-cod-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      Paiement à la livraison (COD)
    </span>
  );
}

export function TrustBadges({ labels }: { labels: readonly string[] | string[] }) {
  return (
    <ul className="store-trust-grid grid grid-cols-2 gap-2 sm:grid-cols-4" role="list">
      {labels.map((label) => (
        <li key={label} className="store-trust-item rounded-xl border bg-card px-3 py-2.5 text-center text-xs font-medium">
          {label}
        </li>
      ))}
    </ul>
  );
}

export function HeroSection({
  title,
  subtitle,
  badge,
  children,
  variant = 'classic',
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children?: ReactNode;
  variant?: 'classic' | 'dark' | 'minimal' | 'service';
}) {
  const panelClass =
    variant === 'dark'
      ? 'store-hero-panel store-hero-panel--dark'
      : variant === 'minimal'
        ? 'store-hero-panel store-hero-panel--minimal'
        : variant === 'service'
          ? 'store-hero-panel store-hero-panel--service'
          : 'store-hero-panel store-hero-panel--classic';

  return (
    <StoreSection spacing="tight" className="store-hero">
      <StoreContainer>
        <div className={panelClass}>
          {badge}
          <h1 className="store-hero-title mt-3">{title}</h1>
          {subtitle && <p className="store-hero-subtitle mt-2 max-w-xl">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap gap-3">{children}</div>}
        </div>
      </StoreContainer>
    </StoreSection>
  );
}

export function StoreCoverHero({
  storeName,
  coverImage,
  slogan,
  badge,
  children,
}: {
  storeName: string;
  logo?: string;
  coverImage?: string;
  slogan?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  const bgStyle = coverImage
    ? { backgroundImage: `url(${resolveUploadUrl(coverImage)})` }
    : undefined;

  return (
    <section className="store-cover-hero" aria-label={`Bannière ${storeName}`}>
      <div className="store-cover-hero__bg" style={bgStyle} />
      <div className="store-cover-hero__overlay" />
      <div className="store-cover-hero__content store-cover-hero__content--slogan-only">
        <div className="store-cover-hero__center">
          {badge}
          {slogan ? <p className="store-cover-hero__slogan">{slogan}</p> : null}
        </div>
        {children ? <div className="store-cover-hero__actions">{children}</div> : null}
      </div>
    </section>
  );
}

export function StoreBrandingHero({
  storeName,
  theme,
  fallbackSubtitle,
  badge,
  children,
  variant = 'classic',
}: {
  storeName: string;
  theme?: { logo?: string; coverImage?: string; slogan?: string };
  fallbackSubtitle?: string;
  badge?: ReactNode;
  children?: ReactNode;
  variant?: 'classic' | 'dark' | 'minimal' | 'service';
}) {
  const hasBranding = Boolean(theme?.coverImage || theme?.slogan || theme?.logo);

  if (hasBranding) {
    return (
      <StoreCoverHero
        storeName={storeName}
        coverImage={theme?.coverImage}
        slogan={theme?.slogan || fallbackSubtitle}
        badge={badge}
      >
        {children}
      </StoreCoverHero>
    );
  }

  return (
    <HeroSection title={storeName} subtitle={fallbackSubtitle} badge={badge} variant={variant}>
      {children}
    </HeroSection>
  );
}

export function PromoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="store-promo-banner border-y py-2.5 text-center text-sm font-medium" role="status">
      {children}
    </div>
  );
}

export function StorePrice({
  amount,
  size = 'md',
  suffix = 'TND',
}: {
  amount: number;
  size?: 'md' | 'lg';
  suffix?: string;
}) {
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <span className={`store-price tabular-nums ${size === 'lg' ? 'store-price--lg' : ''}`}>
      {formatted} {suffix}
    </span>
  );
}
