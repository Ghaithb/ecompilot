import { create } from 'zustand';

interface TenantState {
  tenantId: string | null;
  config: Record<string, any> | null;
  isLoading: boolean;
  setTenant: (tenantId: string, config?: Record<string, any>) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: null,
  config: null,
  isLoading: true,
  setTenant: (tenantId, config) => set({ tenantId, config, isLoading: false }),
  clearTenant: () => set({ tenantId: null, config: null, isLoading: false }),
}));
