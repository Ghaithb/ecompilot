const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface AdCampaign {
  _id: string;
  tenantId: string;
  platform: 'google_ads' | 'meta_ads' | 'tiktok_ads';
  campaignId: string;
  campaignName: string;
  accountId: string;
  status: 'active' | 'paused' | 'ended' | 'deleted';
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
    ctr?: number;
    cpc?: number;
    cpa?: number;
    roas?: number;
    reach?: number;
    frequency?: number;
  };
  startDate?: string;
  endDate?: string;
  lastSyncAt?: string;
  targeting?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const adsApi = {
  // ==================== GOOGLE ADS ====================
  google: {
    /**
     * Get Google Ads authorization URL
     */
    authorize: async (): Promise<{ redirectUrl: string } | { mode: string; message: string }> => {
      const response = await fetch(`${API_URL}/ads/google/authorize`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get Google Ads authorization URL');
      }
      
      return response.json();
    },

    /**
     * Connect Google Ads account
     */
    connect: async (code: string): Promise<{ success: boolean; accountId?: string; mode?: string }> => {
      const response = await fetch(`${API_URL}/ads/google/connect?code=${code}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect Google Ads');
      }
      
      return response.json();
    },

    /**
     * Sync Google Ads campaigns
     */
    syncCampaigns: async (accountId: string): Promise<{ success: boolean; campaignsCount: number }> => {
      const response = await fetch(`${API_URL}/ads/google/${accountId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync Google Ads campaigns');
      }
      
      return response.json();
    },

    /**
     * Get Google Ads campaigns
     */
    getCampaigns: async (accountId?: string): Promise<AdCampaign[]> => {
      const url = accountId 
        ? `${API_URL}/ads/google/campaigns?accountId=${accountId}`
        : `${API_URL}/ads/google/campaigns`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google Ads campaigns');
      }
      
      return response.json();
    },

    /**
     * Disconnect Google Ads account
     */
    disconnect: async (accountId: string): Promise<{ success: boolean }> => {
      const response = await fetch(`${API_URL}/ads/google/${accountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Google Ads');
      }
      
      return response.json();
    },
  },

  // ==================== META ADS ====================
  meta: {
    /**
     * Get Meta Ads authorization URL
     */
    authorize: async (): Promise<{ redirectUrl: string } | { mode: string; message: string }> => {
      const response = await fetch(`${API_URL}/ads/meta/authorize`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get Meta Ads authorization URL');
      }
      
      return response.json();
    },

    /**
     * Connect Meta Ads account
     */
    connect: async (code: string): Promise<{ success: boolean; accountId?: string; accountName?: string; mode?: string }> => {
      const response = await fetch(`${API_URL}/ads/meta/connect?code=${code}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect Meta Ads');
      }
      
      return response.json();
    },

    /**
     * Sync Meta Ads campaigns
     */
    syncCampaigns: async (accountId: string): Promise<{ success: boolean; campaignsCount: number }> => {
      const response = await fetch(`${API_URL}/ads/meta/${accountId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync Meta Ads campaigns');
      }
      
      return response.json();
    },

    /**
     * Get Meta Ads campaigns
     */
    getCampaigns: async (accountId?: string): Promise<AdCampaign[]> => {
      const url = accountId 
        ? `${API_URL}/ads/meta/campaigns?accountId=${accountId}`
        : `${API_URL}/ads/meta/campaigns`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch Meta Ads campaigns');
      }
      
      return response.json();
    },

    /**
     * Disconnect Meta Ads account
     */
    disconnect: async (accountId: string): Promise<{ success: boolean }> => {
      const response = await fetch(`${API_URL}/ads/meta/${accountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Meta Ads');
      }
      
      return response.json();
    },
  },

  // ==================== TIKTOK ADS ====================
  tiktok: {
    /**
     * Get TikTok Ads authorization URL
     */
    authorize: async (): Promise<{ redirectUrl: string } | { mode: string; message: string }> => {
      const response = await fetch(`${API_URL}/ads/tiktok/authorize`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get TikTok Ads authorization URL');
      }
      
      return response.json();
    },

    /**
     * Connect TikTok Ads account
     */
    connect: async (authCode: string): Promise<{ success: boolean; accountId?: string; mode?: string }> => {
      const response = await fetch(`${API_URL}/ads/tiktok/connect?auth_code=${authCode}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect TikTok Ads');
      }
      
      return response.json();
    },

    /**
     * Sync TikTok Ads campaigns
     */
    syncCampaigns: async (accountId: string): Promise<{ success: boolean; campaignsCount: number }> => {
      const response = await fetch(`${API_URL}/ads/tiktok/${accountId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync TikTok Ads campaigns');
      }
      
      return response.json();
    },

    /**
     * Get TikTok Ads campaigns
     */
    getCampaigns: async (accountId?: string): Promise<AdCampaign[]> => {
      const url = accountId 
        ? `${API_URL}/ads/tiktok/campaigns?accountId=${accountId}`
        : `${API_URL}/ads/tiktok/campaigns`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch TikTok Ads campaigns');
      }
      
      return response.json();
    },

    /**
     * Disconnect TikTok Ads account
     */
    disconnect: async (accountId: string): Promise<{ success: boolean }> => {
      const response = await fetch(`${API_URL}/ads/tiktok/${accountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect TikTok Ads');
      }
      
      return response.json();
    },
  },

  // ==================== GLOBAL ====================
  /**
   * Get all campaigns from all platforms
   */
  getAllCampaigns: async (): Promise<{
    google: number;
    meta: number;
    tiktok: number;
    total: number;
    campaigns: AdCampaign[];
  }> => {
    const response = await fetch(`${API_URL}/ads/campaigns/all`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch all campaigns');
    }
    
    return response.json();
  },
};
