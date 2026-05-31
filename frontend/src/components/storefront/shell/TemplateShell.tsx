import type { ReactNode } from 'react';
import { StorefrontLayout } from '@/modules/storefront/components/StorefrontHeader';
import { StoreCartDrawer, FloatingCheckoutBar } from '@/modules/storefront/components/StoreCartDrawer';
import type { StorefrontTheme } from '@/templates/storefront/types';
import { buildStoreThemeStyle } from '../design-system/theme';
import { WhatsAppFloatingButton } from '../design-system/commerce';

export function TemplateShell({
  children,
  theme,
  whatsappUrl,
}: {
  children: ReactNode;
  theme?: StorefrontTheme;
  whatsappUrl?: string;
}) {
  return (
    <div style={buildStoreThemeStyle(theme)}>
      <StorefrontLayout>{children}</StorefrontLayout>
      <WhatsAppFloatingButton href={whatsappUrl} />
      <StoreCartDrawer />
      <FloatingCheckoutBar />
    </div>
  );
}
