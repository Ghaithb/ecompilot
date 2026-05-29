import { AppRole } from '../enums/app-role.enum';

/**
 * Matrice des permissions par rôle (référence produit).
 * Enforcement via @Roles() + guards sur les controllers.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [AppRole.BUYER]: [
    'store:view',
    'order:create',
    'order:track_own',
    'whatsapp:contact_merchant',
  ],
  [AppRole.MERCHANT]: [
    'store:manage',
    'product:crud',
    'order:manage',
    'order:assign_driver',
    'customer:view',
    'analytics:shop',
    'conversion:center',
    'whatsapp:configure',
    'finance:shop',
    'return:process',
  ],
  [AppRole.DRIVER]: [
    'delivery:view_assigned',
    'delivery:update_status',
    'delivery:upload_proof',
    'delivery:collect_cod',
    'order:refuse_on_delivery',
  ],
  [AppRole.ADMIN]: ['*'],
  [AppRole.SUPER_ADMIN]: ['*'],
};
