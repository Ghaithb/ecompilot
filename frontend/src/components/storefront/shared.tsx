/** Backward-compatible barrel — prefer @/components/storefront */
export {
  TemplateShell,
  CTAButton,
  WhatsAppFloatingButton,
  WhatsAppLink,
  StickyBottomBar,
  CodBadge,
  TrustBadges,
  HeroSection,
  PromoBanner,
  StorePrice,
  StoreContainer,
  StoreSection,
  StoreSectionHeader,
  StoreEmptyState,
  BenefitsList,
  FAQSection,
  TestimonialsSection,
  StorySection,
  PremiumHero,
  CatalogToolbar,
  filterCatalogProducts,
  useCatalogFilters,
  StorefrontProductCard,
  ProductGrid,
  ProductSectionBlock,
  COD_TRUST_LABELS,
  COD_BENEFITS,
  COD_FAQ,
  DEFAULT_TESTIMONIALS,
  SERVICE_PACKAGES,
  WHATSAPP_COLOR,
  buildStoreThemeStyle,
  getStoreLayoutClass,
  layoutFromTemplateId,
} from './index';

import { buildStoreThemeStyle } from './design-system/theme';

/** @deprecated use buildStoreThemeStyle */
export function themeStyle(theme?: Parameters<typeof buildStoreThemeStyle>[0]) {
  return buildStoreThemeStyle(theme);
}
