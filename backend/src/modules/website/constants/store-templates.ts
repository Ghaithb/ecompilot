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

export const STORE_TEMPLATES: Record<StoreTemplateId, StoreTemplatePreset> = {
  'cod-classic': {
    id: 'cod-classic',
    name: 'COD Classic Store',
    description: 'Hero + grid + badges COD — conversion max Tunisie',
    tagline: 'Le template par défaut pour vendre partout',
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
  'cod-minimal': {
    id: 'cod-minimal',
    name: 'Product Focus Store',
    description: 'Landing 1 produit viral · parfait Instagram Ads',
    tagline: 'Un produit, un CTA, une conversion',
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
  'cod-bold': {
    id: 'cod-bold',
    name: 'Catalog Store',
    description: 'Multi-produits · grid e-commerce · promos visibles',
    tagline: 'Catalogue complet pour boutiques établies',
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
  'cod-trust': {
    id: 'cod-trust',
    name: 'Premium Brand Store',
    description: 'Storytelling · image heavy · marques fashion',
    tagline: 'Image de marque premium + COD rassurant',
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
  'cod-instagram': {
    id: 'cod-instagram',
    name: 'Service / Booking Store',
    description: 'Salons & services · réservation · WhatsApp booking',
    tagline: 'Idéal prestations et rendez-vous',
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
};

export const DEFAULT_STORE_TEMPLATE: StoreTemplateId = 'cod-classic';
