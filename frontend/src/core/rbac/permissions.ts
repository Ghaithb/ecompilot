export const Permission = {
  ORDER_READ: 'order:read',
  ORDER_MANAGE: 'order:manage',
  DELIVERY_MANAGE: 'delivery:manage',
  PRODUCT_CRUD: 'product:crud',
  STORE_MANAGE: 'store:manage',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<string, PermissionKey[] | ['*']> = {
  merchant: [Permission.ORDER_READ, Permission.ORDER_MANAGE, Permission.DELIVERY_MANAGE, Permission.PRODUCT_CRUD, Permission.STORE_MANAGE],
  user: [Permission.ORDER_READ, Permission.ORDER_MANAGE, Permission.DELIVERY_MANAGE, Permission.PRODUCT_CRUD, Permission.STORE_MANAGE],
  admin: ['*'],
  super_admin: ['*'],
  driver: [Permission.ORDER_READ],
};

export function hasPermission(roles: string[], permission: PermissionKey): boolean {
  for (const role of roles) {
    const list = ROLE_PERMISSIONS[role];
    if (!list) continue;
    if ((list as string[]).includes('*')) return true;
    if (list.includes(permission)) return true;
  }
  return false;
}
