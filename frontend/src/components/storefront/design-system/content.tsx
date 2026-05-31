import type { ReactNode } from 'react';
import { Check, Star } from 'lucide-react';
import { StoreContainer, StoreSection, StoreSectionHeader } from './layout';

export function BenefitsList({ items }: { items: readonly string[] | string[] }) {
  return (
    <ul className="store-benefits space-y-2.5" role="list">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--store-accent,#10b981)]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function FAQSection({
  items,
  title = 'FAQ',
}: {
  items: ReadonlyArray<{ q: string; a: string }>;
  title?: string;
}) {
  return (
    <StoreSection spacing="tight">
      <StoreContainer width="narrow">
        <StoreSectionHeader title={title} />
        <div className="space-y-3">
          {items.map((item) => (
            <details key={item.q} className="store-faq-item group rounded-xl border bg-card open:shadow-sm">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium list-none [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="border-t px-4 py-3 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </StoreContainer>
    </StoreSection>
  );
}

export function TestimonialsSection({
  quotes,
  title = 'Témoignages clients',
}: {
  quotes: readonly string[] | string[];
  title?: string;
}) {
  return (
    <StoreSection spacing="tight">
      <StoreContainer width="narrow">
        <div className="store-testimonials rounded-2xl border bg-card p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-1.5 font-semibold">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            {title}
          </p>
          <div className="space-y-3">
            {quotes.map((quote) => (
              <blockquote key={quote} className="border-l-2 border-[var(--store-primary-soft)] pl-3 text-sm italic text-muted-foreground">
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </StoreContainer>
    </StoreSection>
  );
}

export function StorySection({
  title,
  body,
  eyebrow = 'Notre histoire',
}: {
  title?: string;
  body: string;
  eyebrow?: string;
}) {
  return (
    <StoreSection>
      <StoreContainer width="narrow">
        <StoreSectionHeader title={title || eyebrow} eyebrow={title ? eyebrow : undefined} align="center" />
        <p className="store-story text-center text-base leading-relaxed text-muted-foreground">{body}</p>
      </StoreContainer>
    </StoreSection>
  );
}

export function PremiumHero({
  image,
  title,
  subtitle,
  eyebrow = 'Collection',
  children,
}: {
  image: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <section className="store-premium-hero relative aspect-[16/9] max-h-[70vh] w-full overflow-hidden bg-slate-900">
      <img src={image} alt="" className="h-full w-full object-cover opacity-90" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
        <StoreContainer>
          <p className="store-eyebrow mb-2 text-white/70">{eyebrow}</p>
          <h1 className="store-display max-w-3xl text-white">{title}</h1>
          {subtitle && <p className="mt-2 max-w-md text-sm text-white/85">{subtitle}</p>}
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </StoreContainer>
      </div>
    </section>
  );
}
