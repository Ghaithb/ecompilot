import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/core/auth';

export type TenantContextValue = {
  tenantId: string | null;
  roles: string[];
};

const TenantCtx = createContext<TenantContextValue>({ tenantId: null, roles: [] });

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const value = useMemo(
    () => ({
      tenantId: user?.tenantId ?? null,
      roles: user?.roles ?? [],
    }),
    [user],
  );
  return <TenantCtx.Provider value={value}>{children}</TenantCtx.Provider>;
};

export const useTenant = () => useContext(TenantCtx);
