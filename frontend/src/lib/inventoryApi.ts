import { api } from '@/lib/api';
import type { InventorySummary, InventoryItem } from '@/types/inventory';

export const inventoryApi = {
  getSummary: async (): Promise<InventorySummary> => {
    const response = await api.get('/inventory/summary');
    const data = response.data;
    // Map backend summary structure to frontend InventorySummary type
    return {
      totalProducts: data?.totals?.products ?? 0,
      totalValue: data?.totals?.inventoryValue ?? 0,
      lowStockCount: 0, // computed client-side from items if needed
      outOfStockCount: 0,
      platforms: data?.platforms ?? [],
    } as InventorySummary;
  },

  getItems: async (params?: { page?: number; limit?: number; search?: string; category?: string; stockStatus?: 'all'|'ok'|'low'|'out'; lowThreshold?: number; }): Promise<{ items: InventoryItem[]; total: number; page: number; limit: number; lowThreshold: number; }> => {
    const response = await api.get('/inventory/items', { params });
    return response.data;
  },

  adjustStock: async (productId: string, sku: string, quantity: number) => {
    const response = await api.patch(`/inventory/${productId}/variants/${sku}`, { quantity });
    return response.data;
  },
};