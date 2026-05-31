import { api } from '@/lib/api';
import { STORE_TEMPLATES, type StoreTemplateId } from '@/constants/store-templates';

export type ShopNiche = 'general' | 'mode' | 'tech' | 'maison' | 'beaute';

export interface WebsiteSummary {
  _id: string;
  slug: string;
  name: string;
  published?: boolean;
  businessType?: string;
  storeTemplate?: string;
}

export async function fetchMyWebsite(): Promise<WebsiteSummary | null> {
  try {
    const { data } = await api.get<WebsiteSummary>('/website');
    return data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw err;
  }
}

export type QuickBoutiqueInput = {
  shopName: string;
  email: string;
  phone?: string;
  city?: string;
  niche?: ShopNiche;
  slogan?: string;
  seedStarterProducts?: boolean;
};

/** Génération boutique COD — payload enrichi (niche, slogan, produits démarrage) */
export async function generateQuickBoutique(input: QuickBoutiqueInput & { storeTemplate?: string }) {
  const template =
    STORE_TEMPLATES.find((t) => t.id === (input.storeTemplate as StoreTemplateId)) || STORE_TEMPLATES[0];

  const { data } = await api.post('/website/generate', {
    companyName: input.shopName.trim(),
    storeTemplate: input.storeTemplate || template.id,
    seedStarterProducts: input.seedStarterProducts !== false,
    business: {
      industry: 'ecommerce',
      niche: input.niche || 'general',
      description: `Boutique en ligne ${input.shopName.trim()} — paiement à la livraison en Tunisie`,
      primaryGoal: 'Vendre avec checkout COD et WhatsApp',
    },
    contact: {
      email: input.email,
      phone: input.phone || undefined,
      city: input.city || 'Tunis',
      country: 'Tunisie',
    },
    branding: {
      primaryColor: template.theme.primaryColor,
      secondaryColor: template.theme.secondaryColor,
      slogan: input.slogan?.trim() || undefined,
    },
  });
  return data as WebsiteSummary & {
    slug?: string;
    message?: string;
    updated?: boolean;
    starterProducts?: number;
  };
}

/** Régénère le HTML de la boutique (corrige checkout / produits) — garde le même slug */
export async function refreshStoreHtml(phone?: string) {
  const { data } = await api.post<{ slug: string; refreshed: boolean }>('/website/refresh', {
    phone: phone || undefined,
  });
  return data;
}
