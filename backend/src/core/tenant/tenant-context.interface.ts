/**
 * Contexte tenant propagé par TenantGuard sur chaque requête authentifiée.
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
  roles: string[];
}

export const TENANT_CONTEXT_KEY = 'tenantContext';
