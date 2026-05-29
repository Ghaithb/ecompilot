import { api } from '@/lib/api';
import type { ApiResponse, FinancingDashboard, FinancingSimulation, FinancingRequest } from '@/types/api';

export const financingApi = {
  getDashboard: async (): Promise<FinancingDashboard> => {
    const response = await api.get<ApiResponse<FinancingDashboard>>('/financing/dashboard');
    return response.data.data;
  },

  simulate: async (data: { salesHistory: { totalSales: number } }): Promise<FinancingSimulation> => {
    const response = await api.post<ApiResponse<FinancingSimulation>>('/financing/simulate', data);
    return response.data.data;
  },

  request: async (data: FinancingRequest): Promise<FinancingSimulation> => {
    const response = await api.post<ApiResponse<FinancingSimulation>>('/financing/request', data);
    return response.data.data;
  },
};