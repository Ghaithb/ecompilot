export type StoreTemplateId =
  | 'cod-classic'
  | 'cod-minimal'
  | 'cod-bold'
  | 'cod-trust'
  | 'cod-instagram';

export type StoreTemplateLayout =
  | 'classic'
  | 'product-focus'
  | 'catalog'
  | 'premium'
  | 'service';

export interface StoreTemplatePreset {
  id: StoreTemplateId;
  name: string;
  description: string;
  tagline: string;
  recommendedFor: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    font: string;
  };
  layout: StoreTemplateLayout;
}

export const STORE_TEMPLATES: StoreTemplatePreset[] = [
  {
    id: 'cod-classic',
    name: 'COD Classic Store',
    description: 'Hero + grid + badges COD — conversion max Tunisie',
    tagline: 'Le template par défaut pour vendre partout',
    recommendedFor: 'Boutiques généralistes · COD Tunisie',
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      font: 'Inter',
    },
    layout: 'classic',
  },
  {
    id: 'cod-minimal',
    name: 'Product Focus Store',
    description: 'Landing 1 produit viral · parfait Instagram Ads',
    tagline: 'Un produit, un CTA, une conversion',
    recommendedFor: 'Landing 1 produit · campagnes Meta / Instagram',
    theme: {
      primaryColor: '#111827',
      secondaryColor: '#374151',
      accentColor: '#2563eb',
      backgroundColor: '#fafafa',
      textColor: '#111827',
      font: 'Inter',
    },
    layout: 'product-focus',
  },
  {
    id: 'cod-bold',
    name: 'Catalog Store',
    description: 'Multi-produits · grid e-commerce · promos visibles',
    tagline: 'Catalogue complet pour boutiques établies',
    recommendedFor: 'Catalogues larges · filtres · promos',
    theme: {
      primaryColor: '#dc2626',
      secondaryColor: '#ea580c',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1c1917',
      font: 'Inter',
    },
    layout: 'catalog',
  },
  {
    id: 'cod-trust',
    name: 'Premium Brand Store',
    description: 'Storytelling · image heavy · marques fashion',
    tagline: 'Image de marque premium + COD rassurant',
    recommendedFor: 'Mode · marques · storytelling visuel',
    theme: {
      primaryColor: '#0f172a',
      secondaryColor: '#334155',
      accentColor: '#10b981',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      font: 'Inter',
    },
    layout: 'premium',
  },
  {
    id: 'cod-instagram',
    name: 'Service / Booking Store',
    description: 'Salons & services · réservation · WhatsApp booking',
    tagline: 'Idéal prestations et rendez-vous',
    recommendedFor: 'Salons · prestations · réservation WhatsApp',
    theme: {
      primaryColor: '#7c3aed',
      secondaryColor: '#db2777',
      accentColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#18181b',
      font: 'Inter',
    },
    layout: 'service',
  },
];

export const DEFAULT_STORE_TEMPLATE: StoreTemplateId = 'cod-classic';

export const STORE_TEMPLATE_BY_ID = Object.fromEntries(
  STORE_TEMPLATES.map((t) => [t.id, t]),
) as Record<StoreTemplateId, StoreTemplatePreset>;
