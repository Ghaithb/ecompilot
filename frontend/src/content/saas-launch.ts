/** Contenu produit — EcomPilot SaaS Launch (vendable J7). */

export const SAAS_TAGLINE =
  'Delivery + Order automation for e-commerce Tunisia';

export const SAAS_TAGLINE_FR =
  'Livraison & automatisation des commandes pour l\'e-commerce en Tunisie';

export const SAAS_USE_CASE =
  'Centralisez vos commandes COD, expédiez en 1 clic via INTIGO / First Delivery / Shipper, et suivez chaque colis.';

export const MVP_FEATURES = [
  {
    title: 'Hub commandes',
    description: 'Liste, statuts, cycle de vie COD — de la confirmation à la livraison.',
  },
  {
    title: 'Multi-transporteurs TN',
    description: 'Connectez votre clé API (BYO). INTIGO, First Delivery, Shipper.',
  },
  {
    title: 'Expédition en 1 clic',
    description: 'Créez un colis depuis une commande, suivi et webhooks transporteur.',
  },
  {
    title: 'Notifications WhatsApp',
    description: 'Confirmation commande au client (Meta Business API).',
  },
  {
    title: 'Tableau de bord simple',
    description: 'Commandes à expédier, colis en transit, taux de livraison.',
  },
] as const;

export const PRICING_PLANS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 49,
    currency: 'DT',
    period: '/mois',
    description: 'Pour démarrer et tester avec un volume modéré.',
    features: [
      'Jusqu\'à 100 commandes / mois',
      '1 transporteur connecté',
      'Dashboard commandes & livraison',
      'Support email',
    ],
    cta: 'Commencer Starter',
    highlighted: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 95,
    currency: 'DT',
    period: '/mois',
    description: 'Pour boutiques actives qui expédient tous les jours.',
    features: [
      'Commandes illimitées',
      '3 transporteurs connectés',
      'WhatsApp automatique',
      'Priorité support',
    ],
    cta: 'Passer Pro',
    highlighted: true,
  },
] as const;

export type PlanId = (typeof PRICING_PLANS)[number]['id'];

export const ACTIVATION_STEPS = [
  {
    id: 'plan',
    title: 'Choisir votre offre',
    description: 'Starter 49 DT ou Pro 95 DT — sans engagement carte (virement / cash).',
  },
  {
    id: 'carrier',
    title: 'Connecter un transporteur',
    description: 'Collez votre token API INTIGO, First Delivery ou Shipper.',
  },
  {
    id: 'first-shipment',
    title: 'Expédier votre 1ère commande',
    description: 'Créez une commande test et générez un numéro de suivi.',
  },
] as const;

export const ONBOARDING_TASKS = [
  {
    id: 'connect-carrier',
    title: 'Connecter un transporteur',
    description: 'Au moins 1 clé API active',
    route: '/delivery/connect',
  },
  {
    id: 'first-order',
    title: 'Recevoir une commande',
    description: 'Manuelle ou depuis votre boutique',
    route: '/orders',
  },
  {
    id: 'first-shipment',
    title: 'Créer une expédition',
    description: 'Lier commande → colis transporteur',
    route: '/delivery/shipments',
  },
] as const;
