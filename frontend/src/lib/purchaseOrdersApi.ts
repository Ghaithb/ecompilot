import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { PurchaseOrder, CreatePurchaseOrderInput } from '@/types/purchaseOrder';

export const purchaseOrdersApi = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get<ApiResponse<PurchaseOrder[]>>('/purchase-orders');
    return response.data.data;
  },

  create: async (data: CreatePurchaseOrderInput): Promise<PurchaseOrder> => {
    const response = await api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreatePurchaseOrderInput>): Promise<PurchaseOrder> => {
    const response = await api.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`);
  },
};