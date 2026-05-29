import { api } from '@/lib/api';

export interface EmailCampaign {
  _id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  sentCount: number;
  openRate: number;
  clickRate: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export const emailMarketingApi = {
  getCampaigns: async () => {
    const response = await api.get<{ campaigns: EmailCampaign[]; total: number }>('/email-marketing/campaigns');
    return response.data;
  },

  getCampaign: async (id: string) => {
    const response = await api.get<EmailCampaign>(`/email-marketing/campaigns/${id}`);
    return response.data;
  },

  getCampaignStats: async (id: string) => {
    const response = await api.get<CampaignStats>(`/email-marketing/campaigns/${id}/stats`);
    return response.data;
  },

  createCampaign: async (data: Partial<EmailCampaign>) => {
    const response = await api.post<EmailCampaign>('/email-marketing/campaigns', data);
    return response.data;
  },

  sendCampaign: async (id: string) => {
    const response = await api.post(`/email-marketing/campaigns/${id}/send`);
    return response.data;
  },

  deleteCampaign: async (id: string) => {
    const response = await api.delete(`/email-marketing/campaigns/${id}`);
    return response.data;
  },

  getSubscribers: async () => {
    const response = await api.get('/email-marketing/subscribers');
    return response.data;
  },

  getTemplates: async () => {
    const response = await api.get('/email-marketing/templates');
    return response.data;
  },
};
