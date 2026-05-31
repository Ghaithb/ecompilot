import { apiUrl, getAuthHeaders } from '@/lib/apiConfig';

export type DomainStatus = {
  slug: string;
  defaultUrl: string;
  subdomainHint: string;
  customDomain?: string;
  dnsTarget: string;
  dnsVerified: boolean;
  dnsVerifiedAt?: string;
  sslEnabled: boolean;
  instructions: { cname: string; root: string };
  checks?: Array<{ type: string; host: string; ok: boolean; value?: string }>;
  verified?: boolean;
};

export async function fetchDomainStatus(): Promise<DomainStatus> {
  const res = await fetch(apiUrl('/website/domain'), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Impossible de charger le domaine');
  return res.json();
}

export async function updateCustomDomain(customDomain?: string): Promise<DomainStatus> {
  const res = await fetch(apiUrl('/website/domain'), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ customDomain: customDomain || '' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur domaine');
  }
  return res.json();
}

export async function verifyDomainDns(): Promise<DomainStatus> {
  const res = await fetch(apiUrl('/website/domain/verify'), {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Vérification DNS échouée');
  }
  return res.json();
}

export async function updateWebsiteAnalytics(payload: {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableTracking?: boolean;
}) {
  const res = await fetch(apiUrl('/website/analytics'), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erreur analytics');
  return res.json();
}

export async function applyStoreTemplate(templateId: string) {
  const res = await fetch(apiUrl('/website/template'), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ templateId }),
  });
  if (!res.ok) throw new Error('Erreur template');
  return res.json();
}

export type StoreBranding = {
  logo?: string;
  coverImage?: string;
  slogan?: string;
};

export type WebsiteConfig = {
  id: string;
  slug: string;
  name: string;
  storeTemplate?: string;
  theme?: StoreBranding & Record<string, string | undefined>;
};

export async function fetchWebsiteConfig(): Promise<WebsiteConfig> {
  const res = await fetch(apiUrl('/website/config'), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Impossible de charger la configuration');
  return res.json();
}

export async function updateStoreBranding(payload: Partial<StoreBranding>) {
  const res = await fetch(apiUrl('/website/branding'), {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur enregistrement');
  }
  return res.json() as Promise<{ theme: StoreBranding }>;
}
