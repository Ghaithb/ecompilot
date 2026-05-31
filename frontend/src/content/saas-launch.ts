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

/** Plan de lancement stratégique (phases 1–4) */
export const LAUNCH_POSITIONING = {
  headline: 'Le copilote revenu du COD tunisien',
  subheadline:
    'Converty et TikTak vous donnent une boutique. EcomPilot vous dit où vous perdez de l\'argent et quoi faire aujourd\'hui.',
  trialDays: 14,
} as const;

export const PILOT_PROGRAM = {
  title: 'Programme pilotes COD',
  description:
    'Marchands Instagram/Facebook qui subissent refus et abandons — onboarding en 15 minutes, support WhatsApp direct.',
  cta: 'Rejoindre les pilotes',
  slots: 20,
} as const;

export const CASE_STUDIES = [
  {
    id: 'sfax-mode',
    merchant: 'Boutique mode Sfax',
    metric: '+1 240 TND récupérés',
    detail: 'Relances paniers abandonnés + refus COD anticipés en 30 jours.',
    period: '30 jours',
    verified: true,
    methodology: 'Delta revenu recovery vs baseline 30 j précédents (Revenue Ops Engine).',
  },
  {
    id: 'cosmetiques-tunis',
    merchant: 'Cosmétiques Tunis',
    metric: '−18% refus livraison',
    detail: 'Scoring COD + meilleur transporteur par gouvernorat.',
    period: '45 jours',
    verified: true,
    methodology: 'Taux refus livraison avant/après activation trust scoring + routing transporteur.',
  },
  {
    id: 'accessoires-phone',
    merchant: 'Accessoires phone',
    metric: '92% taux livraison',
    detail: 'Manifests livreur + réconciliation cash quotidienne.',
    period: '60 jours',
    verified: true,
    methodology: 'Colis livrés / colis expédiés sur période glissante, manifests signés.',
  },
] as const;

export const SERVICE_PAGES = [
  {
    slug: 'cod-recovery',
    title: 'Recovery paniers COD',
    titleAr: 'استرداد سلات COD',
    description:
      'Relances WhatsApp et SMS scorées pour récupérer les abandons avant qu\'ils ne deviennent des refus.',
    descriptionAr: 'تذكيرات WhatsApp و SMS لاسترداد السلات قبل أن تصبح رفضاً.',
    bullets: ['Scoring panier par valeur COD', 'Relances multi-canal', 'Tableau ROI recovery'],
  },
  {
    slug: 'delivery-hub',
    title: 'Hub livraison multi-transporteurs',
    titleAr: 'مركز شحن متعدد الناقلين',
    description:
      'INTIGO, First Delivery, Shipper, Aramex, Mylerz — expédition et manifests depuis un seul écran.',
    descriptionAr: 'INTIGO و First Delivery و Shipper و Aramex و Mylerz — شحن وبيانات من شاشة واحدة.',
    bullets: ['Comparaison tarifs', 'Manifests imprimables', 'Sync tracking automatique'],
  },
  {
    slug: 'refus-cod',
    title: 'Scoring anti-refus COD',
    titleAr: 'تقييم مخاطر رفض COD',
    description:
      'Anticipez les refus par numéro de téléphone et gouvernorat avant d\'expédier.',
    descriptionAr: 'توقّع الرفض حسب رقم الهاتف والولاية قبل الشحن.',
    bullets: ['Trust score par client', 'Blocage suspect', 'Badges risque sur retours'],
  },
] as const;

export const MOAT_FEATURES = [
  'Prédiction refus COD par numéro de téléphone',
  'Automatisations recovery WhatsApp + SMS',
  'API ouverte livraison & commandes',
  'INTIGO · First Delivery · Shipper · Aramex · Mylerz',
] as const;

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
