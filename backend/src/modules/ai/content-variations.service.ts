import { Injectable } from '@nestjs/common';

/**
 * Générateur de variations de contenu
 * Évite la répétition et crée du contenu unique à chaque fois
 */
@Injectable()
export class ContentVariationsService {
  
  /**
   * Génère des variations de texte pour éviter la duplication
   */
  generateVariations(template: string, context: any): string {
    let result = template;
    
    // Remplacer les variables
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, context[key]);
    });

    // Ajouter des variations contextuelles
    result = this.applyRandomVariations(result);
    
    return result;
  }

  /**
   * Applique des variations aléatoires pour unicité
   */
  private applyRandomVariations(text: string): string {
    // Variations de mots courants
    const replacements = {
      'excellent': ['exceptionnel', 'remarquable', 'supérieur', 'excellent'],
      'qualité': ['qualité premium', 'qualité supérieure', 'excellence', 'qualité'],
      'service': ['prestation', 'service', 'accompagnement', 'prise en charge'],
      'professionnel': ['expert', 'spécialisé', 'professionnel', 'qualifié'],
      'satisfaction': ['contentement', 'satisfaction', 'plaisir', 'bonheur']
    };

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      const variations = replacements[key];
      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      text = text.replace(regex, randomVariation);
    });

    return text;
  }

  /**
   * Génère des descriptions de services uniques
   */
  generateUniqueServiceDescription(serviceName: string, businessType: string, index: number): string {
    const templates = this.getServiceTemplates(businessType);
    const template = templates[serviceName] || [];
    
    if (template.length === 0) return `Service professionnel de ${serviceName}`;
    
    // Choisir une variation différente selon l'index
    const variation = template[index % template.length];
    return variation;
  }

  /**
   * Génère des témoignages uniques et crédibles
   */
  generateUniqueTestimonial(businessType: string, index: number, companyName: string): any {
    const names = [
      'Sophie M.', 'Pierre D.', 'Marie L.', 'Thomas B.', 'Isabelle R.',
      'Alexandre M.', 'Camille P.', 'Julien T.', 'Emma D.', 'Lucas F.',
      'Léa S.', 'Antoine C.', 'Clara V.', 'Hugo L.', 'Sarah G.'
    ];

    const templates = this.getTestimonialTemplates(businessType, companyName);
    const template = templates[index % templates.length];

    return {
      name: names[index % names.length],
      rating: 5,
      text: template,
      date: this.getRecentDate(index)
    };
  }

  /**
   * Génère des questions FAQ uniques
   */
  generateUniqueFAQ(businessType: string, city: string): any[] {
    const faqBank = this.getFAQBank(businessType, city);
    
    // Mélanger et prendre les 4 premières
    return this.shuffleArray(faqBank).slice(0, 4);
  }

  /**
   * Génère des articles de blog uniques
   */
  generateUniqueBlogPosts(businessType: string, companyName: string): any[] {
    const topics = this.getBlogTopics(businessType);
    
    return topics.slice(0, 3).map((topic, index) => ({
      title: topic.title.replace('{company}', companyName),
      excerpt: topic.excerpt,
      category: topic.category,
      readTime: topic.readTime
    }));
  }

  /**
   * Génère des CTAs uniques et percutants
   */
  generateUniqueCTAs(businessType: string, companyName: string): string[] {
    const ctaBank = this.getCTABank(businessType, companyName);
    
    // Mélanger et prendre les 4 premiers
    return this.shuffleArray(ctaBank).slice(0, 4);
  }

  // Templates de services
  private getServiceTemplates(businessType: string) {
    return {
      'Conseil Personnalisé': [
        'Un accompagnement sur-mesure pour identifier vos besoins et vous guider vers la solution parfaite.',
        'Échange individuel approfondi pour comprendre vos attentes et vous conseiller de manière personnalisée.',
        'Expertise dédiée pour analyser votre situation et vous proposer les meilleures recommandations.'
      ],
      'Coloration': [
        'Transformation capillaire avec des produits premium sans ammoniaque pour un résultat éclatant et durable.',
        'Expertise couleur avec techniques modernes et produits haut de gamme pour sublimer votre chevelure.',
        'Service coloration complet incluant diagnostic, application experte et soin protecteur professionnel.'
      ]
    };
  }

  // Templates de témoignages
  private getTestimonialTemplates(businessType: string, companyName: string) {
    const templates = {
      default: [
        `Expérience exceptionnelle chez ${companyName} ! L'accueil est chaleureux et le service irréprochable. Je recommande vivement !`,
        `Très satisfait de ma visite chez ${companyName}. L'équipe est professionnelle, à l'écoute et les résultats sont au rendez-vous.`,
        `Je ne peux que recommander ${companyName}. Qualité, professionnalisme et attention aux détails sont au programme.`,
        `${companyName} a dépassé mes attentes ! Service impeccable, conseils avisés et résultat parfait. Je reviendrai sans hésiter.`,
        `Enfin un endroit où l'on se sent vraiment pris en charge ! ${companyName} allie compétence et bienveillance à la perfection.`
      ]
    };

    return templates.default;
  }

  // Banque de FAQ
  private getFAQBank(businessType: string, city: string) {
    const commonFAQs = [
      {
        question: 'Comment prendre rendez-vous ?',
        answer: 'Vous pouvez réserver en ligne 24h/24 sur notre site, par téléphone ou directement en magasin. Confirmation immédiate.',
        category: 'Réservation'
      },
      {
        question: 'Quels sont vos tarifs ?',
        answer: 'Nos tarifs sont compétitifs et transparents. Consultez notre page tarifs ou contactez-nous pour un devis personnalisé.',
        category: 'Tarifs'
      },
      {
        question: 'Proposez-vous des promotions ?',
        answer: 'Oui ! Nous proposons régulièrement des offres spéciales. Abonnez-vous à notre newsletter pour ne rien manquer.',
        category: 'Promotions'
      },
      {
        question: 'Où êtes-vous situés ?',
        answer: `Nous sommes situés en plein centre de ${city}, facilement accessible en transports en commun avec parking à proximité.`,
        category: 'Localisation'
      },
      {
        question: 'Acceptez-vous les paiements par carte ?',
        answer: 'Oui, nous acceptons tous les moyens de paiement : espèces, carte bancaire, chèque et paiement mobile.',
        category: 'Paiement'
      },
      {
        question: 'Puis-je annuler ou modifier ma réservation ?',
        answer: 'Oui, vous pouvez modifier ou annuler gratuitement jusqu\'à 24h avant votre rendez-vous.',
        category: 'Réservation'
      }
    ];

    return commonFAQs;
  }

  // Topics de blog
  private getBlogTopics(businessType: string) {
    const topics = {
      default: [
        {
          title: 'Guide Complet 2024 : Tout Ce Que Vous Devez Savoir',
          excerpt: 'Découvrez notre guide expert avec conseils pratiques, astuces professionnelles et tendances actuelles...',
          category: 'Guide',
          readTime: '8 min'
        },
        {
          title: 'Les 10 Erreurs à Éviter Absolument',
          excerpt: 'Apprenez des erreurs des autres ! Notre expertise pour vous éviter les pièges courants et réussir à coup sûr...',
          category: 'Conseils',
          readTime: '6 min'
        },
        {
          title: 'Tendances 2024 : Ce Qui Va Faire la Différence',
          excerpt: 'Restez à la pointe avec notre analyse des tendances émergentes et innovations qui transforment le secteur...',
          category: 'Tendances',
          readTime: '7 min'
        },
        {
          title: 'Interview Exclusive : Les Secrets de Notre Expert',
          excerpt: 'Plongez dans les coulisses et découvrez les techniques professionnelles qui font notre différence...',
          category: 'Interview',
          readTime: '10 min'
        }
      ]
    };

    return topics.default;
  }

  // Banque de CTAs
  private getCTABank(businessType: string, companyName: string) {
    return [
      `Réservez votre place dès maintenant`,
      `Découvrez nos services exceptionnels`,
      `Contactez-nous pour un devis gratuit`,
      `Prenez rendez-vous en ligne`,
      `Profitez de notre offre découverte`,
      `Visitez-nous et laissez-vous convaincre`,
      `Demandez votre consultation gratuite`,
      `Rejoignez nos clients satisfaits`
    ];
  }

  // Helpers
  private shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getRecentDate(index: number): string {
    const daysAgo = (index + 1) * 5;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }
}
