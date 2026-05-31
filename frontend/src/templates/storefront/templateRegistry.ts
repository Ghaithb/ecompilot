import type { StorefrontTemplate } from './types';
import { CODClassicTemplate } from './CODClassicTemplate';
import { ProductFocusTemplate } from './ProductFocusTemplate';
import { CatalogTemplate } from './CatalogTemplate';
import { PremiumBrandTemplate } from './PremiumBrandTemplate';
import { ServiceBookingTemplate } from './ServiceBookingTemplate';

export const storefrontTemplates: StorefrontTemplate[] = [
  {
    id: 'cod-classic',
    layout: 'classic',
    name: 'COD Classic Store',
    description: 'Boutique COD généraliste · grid · confiance · conversion max',
    previewImage: '/templates/cod-classic.svg',
    component: CODClassicTemplate,
  },
  {
    id: 'cod-minimal',
    layout: 'product-focus',
    name: 'Product Focus Store',
    description: 'Landing 1 produit viral · Facebook/Instagram ads',
    previewImage: '/templates/product-focus.svg',
    component: ProductFocusTemplate,
  },
  {
    id: 'cod-bold',
    layout: 'catalog',
    name: 'Catalog Store',
    description: 'Multi-produits · recherche · filtres catégories',
    previewImage: '/templates/catalog.svg',
    component: CatalogTemplate,
  },
  {
    id: 'cod-trust',
    layout: 'premium',
    name: 'Premium Brand Store',
    description: 'Fashion · storytelling · lookbook premium',
    previewImage: '/templates/premium.svg',
    component: PremiumBrandTemplate,
  },
  {
    id: 'cod-instagram',
    layout: 'service',
    name: 'Service / Booking Store',
    description: 'Salons · services · réservation WhatsApp',
    previewImage: '/templates/service.svg',
    component: ServiceBookingTemplate,
  },
];

const ALIAS_MAP: Record<string, string> = {
  classic: 'cod-classic',
  'product-focus': 'cod-minimal',
  minimal: 'cod-minimal',
  catalog: 'cod-bold',
  bold: 'cod-bold',
  premium: 'cod-trust',
  trust: 'cod-trust',
  service: 'cod-instagram',
  instagram: 'cod-instagram',
};

const byId = new Map(storefrontTemplates.map((t) => [t.id, t]));

export function getTemplateById(id?: string | null): StorefrontTemplate {
  const raw = (id || 'cod-classic').trim();
  const resolved = byId.has(raw) ? raw : ALIAS_MAP[raw] || 'cod-classic';
  return byId.get(resolved) ?? storefrontTemplates[0];
}

export function listTemplates(): StorefrontTemplate[] {
  return [...storefrontTemplates];
}

export { CODClassicTemplate, ProductFocusTemplate, CatalogTemplate, PremiumBrandTemplate, ServiceBookingTemplate };
