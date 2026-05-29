import { useAuth } from '@/core/auth';
import { hasPermission, PermissionKey } from './permissions';

export function usePermission(permission: PermissionKey): boolean {
  const { user } = useAuth();
  return hasPermission(user?.roles ?? [], permission);
}

export function usePermissions(permissions: PermissionKey[]): boolean {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  return permissions.every((p) => hasPermission(roles, p));
}
