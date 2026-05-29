import { api } from '@/integrations/api';
import type { Order } from '@/types/order';

/** API module Orders — isolé du UI. */
export const ordersApiModule = {
  list: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },

  listV2: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders/v2');
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/v2/${id}`);
    return data;
  },
};
