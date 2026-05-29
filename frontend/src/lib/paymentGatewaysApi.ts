import { api } from '@/lib/api';

export interface TunisiaPaymentStatus {
  cod: { enabled: boolean; otpRequired: boolean };
  konnect: { connected: boolean; sandbox?: boolean; walletId?: string };
  flouci: { connected: boolean; sandbox?: boolean };
  availableMethods: string[];
}

export const paymentGatewaysApi = {
  getTunisiaStatus: async () => {
    const response = await api.get<TunisiaPaymentStatus>('/payment/tunisia/status');
    return response.data;
  },

  connectKonnect: async (data: { apiKey: string; walletId: string; sandbox?: boolean }) => {
    const response = await api.post('/payment/tunisia/konnect/connect', data);
    return response.data;
  },

  connectFlouci: async (data: { publicKey: string; privateKey: string; sandbox?: boolean }) => {
    const response = await api.post('/payment/tunisia/flouci/connect', data);
    return response.data;
  },

  configureCod: async (data: { enabled: boolean; otpRequired?: boolean }) => {
    const response = await api.post('/payment/tunisia/cod/configure', data);
    return response.data;
  },

  disconnectProvider: async (provider: 'konnect' | 'flouci') => {
    const response = await api.post(`/payment/tunisia/${provider}/disconnect`);
    return response.data;
  },

  initiatePayment: async (orderId: string, provider: 'konnect' | 'flouci') => {
    const response = await api.post('/payment/create-intent', { orderId, provider });
    return response.data as { success: boolean; paymentUrl: string; providerReference: string };
  },

  verifyPayment: async (orderId: string) => {
    const response = await api.get(`/payment/tunisia/verify/${orderId}`);
    return response.data as { paid: boolean; status: string };
  },
};
