import { api } from '@/lib/api';

export interface SocialStatus {
  facebook: {
    connected: boolean;
    pageId?: string;
    pageName?: string;
    connectedAt?: string;
    lastSyncAt?: string;
    expiresAt?: string;
  };
  instagram: {
    connected: boolean;
    accountId?: string;
    username?: string;
    connectedAt?: string;
    lastSyncAt?: string;
    expiresAt?: string;
  };
  twitter: {
    connected: boolean;
    accountId?: string;
    username?: string;
    connectedAt?: string;
    lastSyncAt?: string;
    expiresAt?: string;
  };
  linkedin: {
    connected: boolean;
    organizationId?: string;
    organizationName?: string;
    connectedAt?: string;
    lastSyncAt?: string;
    expiresAt?: string;
  };
}

export const socialMediaApi = {
  // ==================== FACEBOOK ====================
  
  authorizeFacebook: async () => {
    const response = await api.get('/integrations/social/facebook/authorize');
    return response.data;
  },

  connectFacebook: async (code: string, state?: string) => {
    const response = await api.get('/integrations/social/facebook/connect', { 
      params: { code, state } 
    });
    return response.data;
  },

  disconnectFacebook: async () => {
    const response = await api.post('/integrations/social/facebook/disconnect');
    return response.data;
  },

  publishFacebook: async (message: string, imageUrl?: string) => {
    const response = await api.post('/integrations/social/facebook/publish', {
      message,
      imageUrl,
    });
    return response.data;
  },

  getFacebookInsights: async () => {
    const response = await api.get('/integrations/social/facebook/insights');
    return response.data;
  },

  // ==================== INSTAGRAM ====================

  authorizeInstagram: async () => {
    const response = await api.get('/integrations/social/instagram/authorize');
    return response.data;
  },

  connectInstagram: async (code: string) => {
    const response = await api.get('/integrations/social/instagram/connect', { 
      params: { code } 
    });
    return response.data;
  },

  disconnectInstagram: async () => {
    const response = await api.post('/integrations/social/instagram/disconnect');
    return response.data;
  },

  publishInstagram: async (imageUrl: string, caption?: string) => {
    const response = await api.post('/integrations/social/instagram/publish', {
      imageUrl,
      caption,
    });
    return response.data;
  },

  getInstagramInsights: async () => {
    const response = await api.get('/integrations/social/instagram/insights');
    return response.data;
  },

  // ==================== TWITTER ====================

  authorizeTwitter: async () => {
    const response = await api.get('/integrations/social/twitter/authorize');
    return response.data;
  },

  connectTwitter: async (code: string) => {
    const response = await api.get('/integrations/social/twitter/connect', { 
      params: { code } 
    });
    return response.data;
  },

  disconnectTwitter: async () => {
    const response = await api.post('/integrations/social/twitter/disconnect');
    return response.data;
  },

  publishTwitter: async (text: string, mediaIds?: string[]) => {
    const response = await api.post('/integrations/social/twitter/publish', {
      text,
      mediaIds,
    });
    return response.data;
  },

  getTwitterMetrics: async () => {
    const response = await api.get('/integrations/social/twitter/metrics');
    return response.data;
  },

  // ==================== LINKEDIN ====================

  authorizeLinkedin: async () => {
    const response = await api.get('/integrations/social/linkedin/authorize');
    return response.data;
  },

  connectLinkedin: async (code: string) => {
    const response = await api.get('/integrations/social/linkedin/connect', { 
      params: { code } 
    });
    return response.data;
  },

  disconnectLinkedin: async () => {
    const response = await api.post('/integrations/social/linkedin/disconnect');
    return response.data;
  },

  publishLinkedin: async (text: string, imageUrl?: string) => {
    const response = await api.post('/integrations/social/linkedin/publish', {
      text,
      imageUrl,
    });
    return response.data;
  },

  getLinkedinStatistics: async () => {
    const response = await api.get('/integrations/social/linkedin/statistics');
    return response.data;
  },

  // ==================== GLOBAL ====================

  getSocialStatus: async (): Promise<SocialStatus> => {
    const response = await api.get('/integrations/social/status');
    return response.data as SocialStatus;
  },
};
