import { api } from '@/lib/api';

export const analyticsApi = {
  getDashboard: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },

  getSales: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await api.get('/analytics/sales', { params });
    return res.data;
  },

  getInventory: async () => {
    const res = await api.get('/analytics/inventory');
    return res.data;
  },

  getTopProducts: async (limit: number = 5) => {
    const res = await api.get('/analytics/top-products', { params: { limit } });
    return res.data;
  },

  getRevenueChart: async (days: number = 7) => {
    const res = await api.get('/analytics/revenue-chart', { params: { days } });
    return res.data;
  },

  exportData: async (type: 'sales' | 'inventory' | 'all' = 'all', format: 'csv' | 'json' = 'csv') => {
    if (format === 'csv') {
      const res = await api.get('/analytics/export', { params: { type, format }, responseType: 'text' });
      return res.data as string;
    } else {
      const res = await api.get('/analytics/export', { params: { type, format } });
      return res.data;
    }
  },

  getMarketingComparison: async (params?: { providers?: string[]; startDate?: string; endDate?: string }) => {
    const query = {
      ...(params?.providers ? { providers: params.providers.join(',') } : {}),
      ...(params?.startDate ? { startDate: params.startDate } : {}),
      ...(params?.endDate ? { endDate: params.endDate } : {}),
    };
    const res = await api.get('/marketing/compare', { params: query });
    return res.data;
  },
};
