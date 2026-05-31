import { api } from '@/lib/api';

export interface SocialIntegrationStatus {
  facebook?: { connected: boolean; pageId?: string; pageName?: string };
  instagram?: { connected: boolean; accountId?: string; username?: string };
  twitter?: { connected: boolean; userId?: string; username?: string };
  linkedin?: { connected: boolean; organizationId?: string; name?: string };
}

export const integrationsApi = {
  // ===== STRIPE =====
  connectStripe: async () => {
    const auth = await api.get('/integrations/stripe/authorize');
    if (auth.data?.redirectUrl) return auth.data;
    const response = await api.get('/integrations/stripe/connect', { params: { code: 'demo' } });
    return response.data;
  },

  getStripeStatus: async () => {
    const response = await api.get('/integrations/stripe/status');
    return response.data as { connected: boolean; accountId?: string | null };
  },

  disconnectStripe: async () => {
    const response = await api.post('/integrations/stripe/disconnect');
    return response.data;
  },

  // ===== SHOPIFY =====
  connectShopify: async (shop: string) => {
    const response = await api.get('/integrations/shopify/connect', { params: { shop, code: 'demo' } });
    return response.data;
  },

  getShopifyStatus: async () => {
    const response = await api.get('/integrations/shopify/status');
    return response.data as { isConnected: boolean; shopifyProducts?: number; shopifyOrders?: number };
  },

  disconnectShopify: async () => {
    const response = await api.post('/integrations/shopify/disconnect');
    return response.data;
  },

  // ===== SOCIAL MEDIA =====
  getSocialStatus: async () => {
    const response = await api.get<SocialIntegrationStatus>('/integrations/social/status');
    return response.data;
  },

  // Facebook
  authorizeFacebook: async () => {
    const response = await api.get('/integrations/social/facebook/authorize');
    return response.data as { authUrl: string };
  },

  disconnectFacebook: async () => {
    const response = await api.post('/integrations/social/facebook/disconnect');
    return response.data;
  },

  // Instagram
  authorizeInstagram: async () => {
    const response = await api.get('/integrations/social/instagram/authorize');
    return response.data as { authUrl: string };
  },

  disconnectInstagram: async () => {
    const response = await api.post('/integrations/social/instagram/disconnect');
    return response.data;
  },

  // Twitter
  authorizeTwitter: async () => {
    const response = await api.get('/integrations/social/twitter/authorize');
    return response.data as { authUrl: string };
  },

  disconnectTwitter: async () => {
    const response = await api.post('/integrations/social/twitter/disconnect');
    return response.data;
  },

  // LinkedIn
  authorizeLinkedin: async () => {
    const response = await api.get('/integrations/social/linkedin/authorize');
    return response.data as { authUrl: string };
  },

  disconnectLinkedin: async () => {
    const response = await api.post('/integrations/social/linkedin/disconnect');
    return response.data;
  },

  getMessagingStatus: async () => {
    const response = await api.get('/notifications/messaging-status');
    return response.data as {
      sms: { configured: boolean; status: 'live' | 'pilot' | 'coming-soon'; provider: string };
    };
  },
};