/**
 * Séparation des surfaces API — une responsabilité par préfixe.
 */
export const API_ROUTES = {
  /** Boutique publique, suivi commande (sans JWT tenant) */
  PUBLIC: 'public',
  /** Webhooks transporteurs / WhatsApp */
  WEBHOOKS: 'webhooks',
  /** API métier commerçant (JWT + TenantGuard) */
  TENANT: '',
  /** Admin plateforme */
  PLATFORM: 'platform',
} as const;
