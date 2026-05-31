import type { ReactNode } from 'react';

type Width = 'default' | 'narrow' | 'full';

const widthClass: Record<Width, string> = {
  default: 'max-w-[var(--store-max,72rem)]',
  narrow: 'max-w-lg',
  full: 'max-w-none',
};

export function StoreContainer({
  children,
  width = 'default',
  className = '',
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full px-[var(--store-gutter,1rem)] ${widthClass[width]} ${className}`}>
      {children}
    </div>
  );
}

export function StoreSection({
  id,
  children,
  className = '',
  spacing = 'default',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'default' | 'loose';
}) {
  const pad =
    spacing === 'tight' ? 'py-4' : spacing === 'loose' ? 'py-12 sm:py-16' : 'py-6 sm:py-8';
  return (
    <section id={id} className={`store-section ${pad} ${className}`}>
      {children}
    </section>
  );
}

export function StoreSectionHeader({
  title,
  subtitle,
  eyebrow,
  align = 'left',
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: 'left' | 'center';
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';
  return (
    <header className={`mb-5 sm:mb-6 max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="store-eyebrow mb-2">{eyebrow}</p>}
      <h2 className="store-section-title">{title}</h2>
      {subtitle && <p className="store-section-subtitle mt-1.5">{subtitle}</p>}
    </header>
  );
}

export function StoreEmptyState({ message }: { message: string }) {
  return (
    <StoreContainer>
      <p className="store-empty py-16 text-center">{message}</p>
    </StoreContainer>
  );
}
