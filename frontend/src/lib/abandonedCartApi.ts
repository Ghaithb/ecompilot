import { api } from './api';

export const conversionApi = {
  getDashboard: () => api.get('/conversion/dashboard').then((r) => r.data),
  getConversionCenter: () => api.get('/conversion/conversion-center').then((r) => r.data),
  triggerRecovery: (cartId: string) =>
    api.post(`/conversion/recover/${cartId}`).then((r) => r.data),
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics').then((r) => r.data),
  getFunnel: () => api.get('/analytics/funnel').then((r) => r.data),
  getChannels: () => api.get('/analytics/channels').then((r) => r.data),
};

export const abandonedCartApi = {
  getStats: () => api.get('/cart/abandoned/stats').then((r) => r.data),
  list: () => api.get('/cart/abandoned').then((r) => r.data),
  startRecoverySequence: (cartId: string) => conversionApi.triggerRecovery(cartId),
};
