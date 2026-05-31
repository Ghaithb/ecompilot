import { api } from '@/lib/api';

export type MerchantApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
};

export type MerchantApiKeyCreated = MerchantApiKeyRow & { key: string };

export const merchantApiKeys = {
  list: async () => {
    const { data } = await api.get<MerchantApiKeyRow[]>('/merchant-api/keys');
    return data;
  },
  create: async (name: string) => {
    const { data } = await api.post<MerchantApiKeyCreated>('/merchant-api/keys', { name });
    return data;
  },
  revoke: async (id: string) => {
    const { data } = await api.delete<{ revoked: boolean; id: string }>(`/merchant-api/keys/${id}`);
    return data;
  },
};
