/** Rôles de la plateforme EcomPilot (4 acteurs) */
export enum AppRole {
  /** Acheteur — vitrine + checkout (pas de JWT dashboard) */
  BUYER = 'buyer',
  /** Commerçant — propriétaire boutique */
  MERCHANT = 'merchant',
  /** Livreur — tournées COD */
  DRIVER = 'driver',
  /** Grossiste — gestion catalogue vente en gros */
  SUPPLIER = 'supplier',
  /** Admin plateforme (Ghaith) */
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/** Ancien rôle « user » = commerçant */
export const LEGACY_MERCHANT_ROLES = ['user', 'merchant'];

export function expandUserRoles(roles: string[] = []): string[] {
  const set = new Set(roles);
  if (set.has('user') || set.has(AppRole.MERCHANT)) {
    set.add(AppRole.MERCHANT);
    set.add('user');
  }
  if (set.has(AppRole.ADMIN)) {
    set.add(AppRole.SUPER_ADMIN);
  }
  return [...set];
}

export function hasAnyRole(userRoles: string[] | undefined, required: string[]): boolean {
  const expanded = expandUserRoles(userRoles || []);
  return required.some((r) => expanded.includes(r));
}
