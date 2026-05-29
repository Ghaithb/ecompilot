import { AppRole } from '../../common/enums/app-role.enum';

/** Permissions granulaires (RBAC MVP). */
export const Permission = {
  ORDER_READ: 'order:read',
  ORDER_MANAGE: 'order:manage',
  ORDER_ASSIGN_DRIVER: 'order:assign_driver',
  PRODUCT_CRUD: 'product:crud',
  DELIVERY_MANAGE: 'delivery:manage',
  DELIVERY_VIEW: 'delivery:view',
  DRIVER_MANAGE: 'driver:manage',
  STORE_MANAGE: 'store:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<string, PermissionKey[] | ['*']> = {
  [AppRole.MERCHANT]: [
    Permission.ORDER_READ,
    Permission.ORDER_MANAGE,
    Permission.ORDER_ASSIGN_DRIVER,
    Permission.PRODUCT_CRUD,
    Permission.DELIVERY_MANAGE,
    Permission.DELIVERY_VIEW,
    Permission.DRIVER_MANAGE,
    Permission.STORE_MANAGE,
    Permission.SETTINGS_MANAGE,
  ],
  user: [
    Permission.ORDER_READ,
    Permission.ORDER_MANAGE,
    Permission.ORDER_ASSIGN_DRIVER,
    Permission.PRODUCT_CRUD,
    Permission.DELIVERY_MANAGE,
    Permission.DELIVERY_VIEW,
    Permission.DRIVER_MANAGE,
    Permission.STORE_MANAGE,
    Permission.SETTINGS_MANAGE,
  ],
  [AppRole.DRIVER]: [Permission.DELIVERY_VIEW, Permission.ORDER_READ],
  delivery_manager: [
    Permission.DELIVERY_MANAGE,
    Permission.DELIVERY_VIEW,
    Permission.DRIVER_MANAGE,
    Permission.ORDER_READ,
    Permission.ORDER_ASSIGN_DRIVER,
  ],
  [AppRole.ADMIN]: ['*'],
  [AppRole.SUPER_ADMIN]: ['*'],
};

export function resolvePermissions(roles: string[]): Set<string> {
  const perms = new Set<string>();
  for (const role of roles) {
    const list = ROLE_PERMISSIONS[role] || [];
    if ((list as string[]).includes('*')) {
      return new Set(['*']);
    }
    for (const p of list) {
      perms.add(p);
    }
  }
  return perms;
}

export function hasPermission(roles: string[], required: PermissionKey): boolean {
  const perms = resolvePermissions(roles);
  return perms.has('*') || perms.has(required);
}
