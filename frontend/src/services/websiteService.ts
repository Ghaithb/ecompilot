import { api } from '@/lib/api';

export interface WebsiteSummary {
  _id: string;
  slug: string;
  name: string;
  published?: boolean;
  businessType?: string;
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
};

/** Génération boutique COD — payload minimal accepté par l'API */
export async function generateQuickBoutique(input: QuickBoutiqueInput) {
  const { data } = await api.post('/website/generate', {
    companyName: input.shopName.trim(),
    business: {
      industry: 'ecommerce',
      description: `Boutique en ligne ${input.shopName.trim()} — paiement à la livraison`,
      primaryGoal: 'Vendre avec checkout COD et WhatsApp',
    },
    contact: {
      email: input.email,
      phone: input.phone || undefined,
      city: input.city || 'Tunis',
      country: 'Tunisie',
    },
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
    },
  });
  return data as WebsiteSummary & { slug?: string; message?: string };
}

/** Régénère le HTML de la boutique (corrige checkout / produits) — garde le même slug */
export async function refreshStoreHtml(phone?: string) {
  const { data } = await api.post<{ slug: string; refreshed: boolean }>('/website/refresh', {
    phone: phone || undefined,
  });
  return data;
}
