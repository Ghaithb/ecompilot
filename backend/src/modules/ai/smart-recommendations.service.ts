import { Injectable } from '@nestjs/common';

/**
 * Service de recommandations intelligentes
 * Analyse le business et suggère automatiquement des améliorations
 */
@Injectable()
export class SmartRecommendationsService {
  
  /**
   * Génère des recommandations personnalisées pour améliorer le site
   */
  async generateRecommendations(
    businessType: string,
    companyName: string,
    city: string,
    hasProducts: boolean = false,
    hasBlog: boolean = false
  ) {
    const recommendations = {
      priority: this.getPriorityRecommendations(businessType, hasProducts),
      marketing: this.getMarketingRecommendations(businessType, city),
      seo: this.getSEORecommendations(businessType, city, companyName),
      conversion: this.getConversionRecommendations(businessType),
      content: this.getContentRecommendations(businessType, hasBlog),
      social: this.getSocialMediaRecommendations(businessType)
    };

    return recommendations;
  }

  /**
   * Recommandations prioritaires selon le type de business
   */
  private getPriorityRecommendations(businessType: string, hasProducts: boolean) {
    const recommendations = {
      parfum: [
        { 
          icon: '🎁', 
          title: 'Ajoutez un système de réservation en ligne',
          impact: 'high',
          description: 'Les clients pourront réserver leurs conseils personnalisés directement',
          benefit: '+40% de conversions'
        },
        { 
          icon: '📦', 
          title: 'Créez un programme de fidélité',
          impact: 'high',
          description: 'Cartes de fidélité digitales avec points et récompenses',
          benefit: '+60% de clients récurrents'
        },
        { 
          icon: '🎥', 
          title: 'Ajoutez des vidéos de présentation des parfums',
          impact: 'medium',
          description: 'Vidéos courtes présentant les notes et l\'histoire de chaque parfum',
          benefit: '+25% d\'engagement'
        }
      ],
      restaurant: [
        { 
          icon: '📱', 
          title: 'Intégrez la réservation en ligne',
          impact: 'high',
          description: 'Système de réservation automatisé disponible 24/7',
          benefit: '+50% de réservations'
        },
        { 
          icon: '🍽️', 
          title: 'Affichez le menu avec photos',
          impact: 'high',
          description: 'Photos professionnelles de vos plats signature',
          benefit: '+35% de conversions'
        },
        { 
          icon: '⭐', 
          title: 'Collectez automatiquement les avis Google',
          impact: 'high',
          description: 'Widget d\'avis clients avec notation en temps réel',
          benefit: '+70% de confiance'
        }
      ],
      cafe: [
        { 
          icon: '☕', 
          title: 'Activez la commande en ligne',
          impact: 'high',
          description: 'Click & Collect pour éviter l\'attente',
          benefit: '+45% de ventes'
        },
        { 
          icon: '🎟️', 
          title: 'Vendez des cartes cadeaux digitales',
          impact: 'medium',
          description: 'Cartes cadeaux rechargeables en ligne',
          benefit: 'Nouveau revenu'
        },
        { 
          icon: '📅', 
          title: 'Créez un calendrier d\'événements',
          impact: 'medium',
          description: 'Ateliers barista, dégustations, concerts',
          benefit: '+30% de fidélisation'
        }
      ],
      coiffure: [
        { 
          icon: '📅', 
          title: 'Système de prise de RDV en ligne obligatoire',
          impact: 'critical',
          description: 'Planning intelligent avec disponibilités en temps réel',
          benefit: '-80% appels, +50% réservations'
        },
        { 
          icon: '📸', 
          title: 'Galerie avant/après de vos réalisations',
          impact: 'high',
          description: 'Portfolio photo de vos plus belles transformations',
          benefit: '+60% de confiance'
        },
        { 
          icon: '💳', 
          title: 'Paiement en ligne des prestations',
          impact: 'medium',
          description: 'Prépaiement ou acompte lors de la réservation',
          benefit: '-70% de no-shows'
        }
      ],
      immobilier: [
        { 
          icon: '🏡', 
          title: 'Ajoutez des visites virtuelles 360°',
          impact: 'high',
          description: 'Tours virtuels immersifs de vos biens',
          benefit: '+80% d\'intérêt'
        },
        { 
          icon: '🔔', 
          title: 'Système d\'alertes nouveaux biens',
          impact: 'high',
          description: 'Email automatique selon critères clients',
          benefit: '+40% de leads'
        },
        { 
          icon: '💰', 
          title: 'Calculateur de financement intégré',
          impact: 'medium',
          description: 'Simulation de prêt et mensualités instantanée',
          benefit: '+30% de conversions'
        }
      ],
      photographe: [
        { 
          icon: '📸', 
          title: 'Portfolio interactif par catégorie',
          impact: 'critical',
          description: 'Galerie filtrée : mariage, portrait, événementiel',
          benefit: '+70% de conversions'
        },
        { 
          icon: '📅', 
          title: 'Calendrier de disponibilités en temps réel',
          impact: 'high',
          description: 'Réservation directe avec paiement acompte',
          benefit: '+50% de bookings'
        },
        { 
          icon: '🎁', 
          title: 'Vente de packages et bons cadeaux',
          impact: 'medium',
          description: 'Forfaits pré-définis et cartes cadeaux',
          benefit: 'Nouveau revenu'
        }
      ],
      ecole: [
        { 
          icon: '📝', 
          title: 'Formulaire d\'inscription en ligne',
          impact: 'critical',
          description: 'Dossier d\'inscription dématérialisé complet',
          benefit: '-60% de paperasse'
        },
        { 
          icon: '📰', 
          title: 'Espace parents sécurisé',
          impact: 'high',
          description: 'Accès notes, absences, messagerie école',
          benefit: '+90% satisfaction parents'
        },
        { 
          icon: '📅', 
          title: 'Calendrier événements et sorties',
          impact: 'medium',
          description: 'Agenda partagé avec rappels automatiques',
          benefit: 'Meilleure communication'
        }
      ],
      agency: [
        { 
          icon: '📊', 
          title: 'Audit gratuit automatisé',
          impact: 'high',
          description: 'Outil d\'audit en ligne qui génère des leads',
          benefit: '+100% de prospects'
        },
        { 
          icon: '📚', 
          title: 'Bibliothèque de ressources / études de cas',
          impact: 'high',
          description: 'Content marketing avec téléchargements contre email',
          benefit: '+60% de leads qualifiés'
        },
        { 
          icon: '🎓', 
          title: 'Webinaires et formations gratuites',
          impact: 'medium',
          description: 'Positionnement expert avec événements en ligne',
          benefit: '+40% d\'autorité'
        }
      ]
    };

    const businessRecs = recommendations[businessType] || [];
    
    // Ajouter recommandation produits si applicable
    if (!hasProducts && ['parfum', 'cafe', 'immobilier'].includes(businessType)) {
      businessRecs.unshift({
        icon: '🛒',
        title: 'Intégrez votre catalogue produits',
        impact: 'critical',
        description: 'Vente en ligne avec paiement sécurisé',
        benefit: 'Nouveau canal de vente'
      });
    }

    return businessRecs;
  }

  /**
   * Recommandations marketing local
   */
  private getMarketingRecommendations(businessType: string, city: string) {
    return [
      {
        icon: '🗺️',
        title: 'Optimisez votre fiche Google My Business',
        action: 'Complétez votre profil avec photos, horaires, avis',
        impact: `Première position sur "${businessType} ${city}"`
      },
      {
        icon: '📱',
        title: 'Lancez des campagnes Google Ads locales',
        action: `Ciblez "${businessType} ${city}" et variations`,
        impact: '+200% de visibilité locale'
      },
      {
        icon: '📧',
        title: 'Créez une newsletter mensuelle',
        action: 'Partagez actus, promotions, conseils',
        impact: '+40% de clients récurrents'
      },
      {
        icon: '🎯',
        title: 'Utilisez le retargeting Facebook/Instagram',
        action: 'Pixel de suivi pour recibler les visiteurs',
        impact: '+35% de conversions'
      }
    ];
  }

  /**
   * Recommandations SEO spécifiques
   */
  private getSEORecommendations(businessType: string, city: string, companyName: string) {
    return [
      {
        icon: '🔍',
        title: 'Mots-clés longue traîne à cibler',
        keywords: [
          `meilleur ${businessType} ${city}`,
          `${businessType} près de chez moi`,
          `${businessType} ${city} pas cher`,
          `${businessType} ${city} avis`,
          `top ${businessType} ${city}`
        ],
        priority: 'high'
      },
      {
        icon: '📝',
        title: 'Créez des pages par quartier',
        action: `Exemple: "${companyName} - Quartier Marais à ${city}"`,
        benefit: 'Multipliez votre visibilité locale'
      },
      {
        icon: '⭐',
        title: 'Obtenez plus d\'avis clients',
        action: 'Envoyez email automatique 48h après visite',
        benefit: '+100 avis = première position Google'
      },
      {
        icon: '🔗',
        title: 'Créez des backlinks locaux',
        action: 'Annuaires, blogs locaux, partenariats',
        benefit: '+50% d\'autorité de domaine'
      }
    ];
  }

  /**
   * Recommandations optimisation conversion
   */
  private getConversionRecommendations(businessType: string) {
    return [
      {
        icon: '🎯',
        title: 'Ajoutez un chat en direct',
        description: 'Répondez aux questions en temps réel',
        increase: '+30% conversions'
      },
      {
        icon: '⏰',
        title: 'Créez un sentiment d\'urgence',
        examples: ['Places limitées', 'Offre expire dans 24h', 'Derniers créneaux'],
        increase: '+25% d\'actions'
      },
      {
        icon: '🎁',
        title: 'Offrez un bonus à l\'inscription',
        examples: ['Réduction première visite', 'Ebook gratuit', 'Consultation offerte'],
        increase: '+40% d\'inscriptions'
      },
      {
        icon: '📊',
        title: 'Testez différentes versions (A/B)',
        tests: ['Couleur boutons', 'Titres', 'Photos', 'Prix'],
        increase: '+20% en moyenne'
      }
    ];
  }

  /**
   * Recommandations contenu
   */
  private getContentRecommendations(businessType: string, hasBlog: boolean) {
    const recs = [
      {
        icon: '📹',
        title: 'Ajoutez des vidéos',
        types: ['Présentation entreprise', 'Tutoriels', 'Témoignages vidéo', 'Coulisses'],
        impact: '+80% engagement'
      },
      {
        icon: '📸',
        title: 'Utilisez de vraies photos',
        description: 'Photos authentiques de votre équipe, locaux, réalisations',
        impact: '+50% confiance'
      },
      {
        icon: '💬',
        title: 'Affichez vos réseaux sociaux',
        description: 'Flux Instagram, Facebook intégré sur le site',
        impact: '+35% d\'abonnés'
      }
    ];

    if (!hasBlog) {
      recs.unshift({
        icon: '✍️',
        title: 'Lancez un blog',
        types: ['Conseils', 'Actualités', 'Études de cas', 'Guides pratiques'],
        impact: '+300% de trafic SEO'
      });
    }

    return recs;
  }

  /**
   * Recommandations réseaux sociaux
   */
  private getSocialMediaRecommendations(businessType: string) {
    const platforms = {
      parfum: ['Instagram', 'Pinterest', 'TikTok'],
      restaurant: ['Instagram', 'Facebook', 'TripAdvisor'],
      cafe: ['Instagram', 'Facebook', 'Google'],
      coiffure: ['Instagram', 'Facebook', 'Pinterest'],
      immobilier: ['Facebook', 'LinkedIn', 'Instagram'],
      photographe: ['Instagram', 'Pinterest', 'Facebook'],
      ecole: ['Facebook', 'LinkedIn', 'YouTube'],
      agency: ['LinkedIn', 'Twitter', 'YouTube']
    };

    const recommended = platforms[businessType] || ['Facebook', 'Instagram', 'LinkedIn'];

    return {
      platforms: recommended,
      strategies: [
        {
          platform: recommended[0],
          frequency: 'Quotidien',
          contentTypes: ['Photos', 'Stories', 'Reels'],
          objective: 'Engagement et notoriété'
        },
        {
          platform: recommended[1],
          frequency: '3x/semaine',
          contentTypes: ['Posts informatifs', 'Événements', 'Avis clients'],
          objective: 'Communauté locale'
        },
        {
          platform: recommended[2],
          frequency: 'Hebdomadaire',
          contentTypes: ['Articles', 'Vidéos longues', 'Tutoriels'],
          objective: 'Autorité et expertise'
        }
      ],
      postIdeas: this.getPostIdeas(businessType)
    };
  }

  /**
   * Idées de posts selon le business
   */
  private getPostIdeas(businessType: string) {
    const ideas = {
      parfum: [
        'Parfum du jour avec description',
        'Conseil: comment choisir son parfum',
        'Nouveauté de la semaine',
        'Témoignage client avec photo',
        'Coulisses: nos fournisseurs'
      ],
      restaurant: [
        'Plat du jour avec belle photo',
        'Recette de notre chef',
        'Arrivage de produits frais',
        'Événement à venir',
        'Portrait d\'un membre de l\'équipe'
      ],
      cafe: [
        'Café du mois en focus',
        'Latte art du jour',
        'Conseil préparation café maison',
        'Nouveauté pâtisserie',
        'Ambiance du jour'
      ],
      coiffure: [
        'Transformation avant/après',
        'Tendance coiffure saison',
        'Astuce soin cheveux',
        'Couleur du moment',
        'Témoignage cliente'
      ],
      immobilier: [
        'Nouveau bien en exclusivité',
        'Visite virtuelle',
        'Conseil achat immobilier',
        'Prix du marché évolution',
        'Témoignage acheteur/vendeur'
      ],
      photographe: [
        'Photo du jour',
        'Backstage d\'un shooting',
        'Conseil photo pour débutants',
        'Témoignage client avec photos',
        'Prochain événement disponibilité'
      ]
    };

    return ideas[businessType] || [
      'Actualité de l\'entreprise',
      'Conseil expert',
      'Témoignage client',
      'Promotion du moment',
      'Coulisses de l\'équipe'
    ];
  }

  /**
   * Génère un plan d'action sur 30 jours
   */
  async generate30DayPlan(businessType: string, city: string) {
    return {
      week1: {
        title: 'Optimisation Fondations',
        tasks: [
          'Compléter fiche Google My Business',
          'Installer Google Analytics',
          'Créer comptes réseaux sociaux',
          'Prendre photos professionnelles',
          'Rédiger 3 premiers articles blog'
        ]
      },
      week2: {
        title: 'Acquisition Trafic',
        tasks: [
          'Lancer première campagne Google Ads',
          'Optimiser SEO pages principales',
          'Publier quotidiennement sur réseaux',
          'Créer première newsletter',
          'Installer chat en direct'
        ]
      },
      week3: {
        title: 'Conversion & Engagement',
        tasks: [
          'Ajouter témoignages clients',
          'Créer offre spéciale premier achat',
          'Installer système avis automatique',
          'Lancer programme fidélité',
          'Tester différentes versions CTA'
        ]
      },
      week4: {
        title: 'Analyse & Optimisation',
        tasks: [
          'Analyser données Analytics',
          'Optimiser campagnes publicitaires',
          'Ajuster tarifs selon marché',
          'Solliciter plus d\'avis clients',
          'Planifier mois suivant'
        ]
      }
    };
  }

  /**
   * Calcule le score de maturité digitale
   */
  calculateDigitalMaturityScore(website: any) {
    let score = 0;
    const maxScore = 100;

    // Présence en ligne (20 pts)
    if (website.published) score += 10;
    if (website.domain?.customDomain) score += 10;

    // Contenu (25 pts)
    if (website.pages?.length > 3) score += 10;
    if (website.blog?.enabled) score += 8;
    if (website.testimonials?.length > 0) score += 7;

    // SEO (20 pts)
    if (website.seo?.title) score += 5;
    if (website.seo?.description) score += 5;
    if (website.seo?.keywords?.length > 5) score += 5;
    if (website.analytics?.enableTracking) score += 5;

    // E-commerce (15 pts)
    if (website.features?.ecommerce?.enabled) score += 10;
    if (website.settings?.enableCheckout) score += 5;

    // Engagement (20 pts)
    if (website.features?.contact?.enabled) score += 5;
    if (website.features?.newsletter?.enabled) score += 5;
    if (website.features?.booking?.enabled) score += 5;
    if (website.features?.reviews?.enabled) score += 5;

    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      level: this.getMaturityLevel(score)
    };
  }

  private getMaturityLevel(score: number) {
    if (score >= 80) return { label: 'Expert', color: 'green', emoji: '🚀' };
    if (score >= 60) return { label: 'Avancé', color: 'blue', emoji: '📈' };
    if (score >= 40) return { label: 'Intermédiaire', color: 'orange', emoji: '⚡' };
    return { label: 'Débutant', color: 'red', emoji: '🌱' };
  }
}
