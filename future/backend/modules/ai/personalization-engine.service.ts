import { Injectable } from '@nestjs/common';

/**
 * Moteur de personnalisation avancée
 * Génère du contenu unique et professionnel selon le contexte du client
 */
@Injectable()
export class PersonalizationEngineService {
  
  /**
   * Personnalise complètement le contenu selon les données du client
   */
  async personalizeWebsiteContent(businessData: {
    businessType: string;
    companyName: string;
    city: string;
    address?: string;
    phone?: string;
    email?: string;
    description?: string;
    foundingYear?: number;
    teamSize?: number;
    specialties?: string[];
  }) {
    const {
      businessType,
      companyName,
      city,
      address,
      phone,
      email,
      description,
      foundingYear,
      teamSize,
      specialties = []
    } = businessData;

    // Calculer l'ancienneté
    const yearsInBusiness = foundingYear ? new Date().getFullYear() - foundingYear : null;

    return {
      // Informations personnalisées
      personalInfo: this.generatePersonalInfo(businessData),
      
      // Slogan unique basé sur les spécialités
      uniqueSlogan: this.generateUniqueSlogan(businessType, companyName, specialties),
      
      // Description hyper-personnalisée
      personalizedDescription: this.generatePersonalizedDescription(businessData, yearsInBusiness),
      
      // Promesse unique de valeur
      valueProposition: this.generateValueProposition(businessType, city, specialties),
      
      // Histoire de l'entreprise
      companyStory: this.generateCompanyStory(companyName, city, foundingYear, businessType),
      
      // Section "Pourquoi nous choisir"
      whyChooseUs: this.generateWhyChooseUs(businessType, yearsInBusiness, teamSize),
      
      // Process détaillé
      ourProcess: this.generateProcess(businessType),
      
      // Garanties et engagements
      guarantees: this.generateGuarantees(businessType),
      
      // Équipe (si teamSize fourni)
      team: this.generateTeamSection(businessType, teamSize),
      
      // Zones desservies
      serviceAreas: this.generateServiceAreas(city, businessType),
      
      // Horaires personnalisés
      openingHours: this.generateOpeningHours(businessType),
      
      // Offres spéciales selon la saison
      seasonalOffers: this.generateSeasonalOffers(businessType, city),
      
      // Email de bienvenue personnalisé
      welcomeEmail: this.generateWelcomeEmail(companyName, businessType, email),
      
      // Métadonnées enrichies
      enrichedMeta: this.generateEnrichedMeta(businessData, yearsInBusiness)
    };
  }

  /**
   * Génère les informations de contact personnalisées
   */
  private generatePersonalInfo(data: any) {
    const info: any = {
      companyName: data.companyName,
      city: data.city,
      displayAddress: data.address || `Centre-ville de ${data.city}`,
      displayPhone: data.phone ? this.formatPhone(data.phone) : null,
      displayEmail: data.email || `contact@${this.slugify(data.companyName)}.fr`,
      coordinates: this.getCityCoordinates(data.city)
    };

    // Ajouter des informations contextuelles
    if (data.address) {
      info.mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(data.address + ', ' + data.city)}`;
    }

    return info;
  }

  /**
   * Génère un slogan unique basé sur les spécialités
   */
  private generateUniqueSlogan(businessType: string, companyName: string, specialties: string[]) {
    const slogans = {
      parfum: [
        `${specialties[0] || 'L\'art'} de la parfumerie depuis toujours`,
        `Votre signature olfactive unique`,
        `L\'excellence parfumée à ${companyName}`,
        `Créateurs de vos émotions parfumées`
      ],
      restaurant: [
        `${specialties[0] || 'Cuisine'} authentique et passionnée`,
        `Où chaque plat raconte une histoire`,
        `L\'excellence gastronomique au quotidien`,
        `Saveurs d\'exception, moments inoubliables`
      ],
      cafe: [
        `Le café comme vous ne l\'avez jamais goûté`,
        `${specialties[0] || 'Torréfaction'} artisanale et passionnée`,
        `Votre pause café réinventée`,
        `L\'art du café à la perfection`
      ],
      coiffure: [
        `${specialties[0] || 'Coiffure'} sur-mesure et créativité`,
        `Révélez votre style unique`,
        `L\'art capillaire au service de votre beauté`,
        `Expertise et tendances à votre service`
      ],
      immobilier: [
        `${specialties[0] || 'Votre projet'} immobilier entre de bonnes mains`,
        `L\'immobilier autrement`,
        `Votre réussite immobilière, notre engagement`,
        `Expertise locale, service personnalisé`
      ]
    };

    const options = slogans[businessType] || [`Votre partenaire ${businessType} de confiance`];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Génère une description hyper-personnalisée
   */
  private generatePersonalizedDescription(data: any, yearsInBusiness: number | null) {
    const { businessType, companyName, city, description, teamSize, specialties } = data;

    let desc = `${companyName} est `;

    // Ancienneté
    if (yearsInBusiness) {
      desc += `depuis ${yearsInBusiness} ans `;
    }

    // Positionnement
    desc += `votre référence ${businessType} à ${city}. `;

    // Description personnalisée ou générique enrichie
    if (description) {
      desc += `${description} `;
    } else {
      desc += `Notre passion et notre expertise nous permettent de vous offrir un service d\'exception, alliant qualité professionnelle et attention personnalisée. `;
    }

    // Équipe
    if (teamSize) {
      desc += `Notre équipe de ${teamSize} professionnels ${teamSize > 10 ? 'expérimentés' : 'passionnés'} `;
    } else {
      desc += `Notre équipe dévouée `;
    }
    desc += `met tout en œuvre pour dépasser vos attentes à chaque visite. `;

    // Spécialités
    if (specialties && specialties.length > 0) {
      desc += `Spécialisés en ${specialties.join(', ')}, `;
      desc += `nous maîtrisons les techniques les plus avancées et suivons les dernières tendances du secteur. `;
    }

    // Valeurs
    desc += `Chez ${companyName}, nous privilégions l\'excellence, la transparence et la satisfaction client. `;
    desc += `Chaque détail compte pour faire de votre expérience un moment unique et mémorable. `;

    // Call-to-action naturel
    desc += `Faites-nous confiance pour ${this.getBusinessObjective(businessType)} et découvrez pourquoi nos clients nous recommandent à leurs proches.`;

    return desc;
  }

  /**
   * Génère une proposition de valeur unique
   */
  private generateValueProposition(businessType: string, city: string, specialties: string[]) {
    return {
      headline: this.getValueHeadline(businessType, specialties),
      subheadline: `À ${city}, ${this.getValueSubheadline(businessType)}`,
      benefits: this.getUniquebenefits(businessType, specialties),
      differentiators: this.getDifferentiators(businessType)
    };
  }

  /**
   * Génère l'histoire de l'entreprise
   */
  private generateCompanyStory(companyName: string, city: string, foundingYear: number | null, businessType: string) {
    if (!foundingYear) return null;

    const yearsInBusiness = new Date().getFullYear() - foundingYear;
    
    return {
      title: 'Notre Histoire',
      year: foundingYear,
      yearsInBusiness,
      story: `Fondé en ${foundingYear} au cœur de ${city}, ${companyName} est né de la passion de créer une expérience ${businessType} d\'exception. Depuis ${yearsInBusiness} ans, nous avons su évoluer tout en gardant nos valeurs fondamentales : excellence, authenticité et proximité avec nos clients. Aujourd\'hui, nous sommes fiers d\'être devenus une référence incontournable à ${city}, grâce à la confiance que vous nous accordez chaque jour.`,
      milestones: [
        { year: foundingYear, event: `Création de ${companyName}` },
        { year: foundingYear + Math.floor(yearsInBusiness / 3), event: 'Agrandissement de nos locaux' },
        { year: foundingYear + Math.floor(yearsInBusiness / 2), event: 'Introduction de nouveaux services premium' },
        { year: new Date().getFullYear() - 1, event: `Plus de ${this.getClientCount(yearsInBusiness)} clients satisfaits` }
      ]
    };
  }

  /**
   * Génère la section "Pourquoi nous choisir"
   */
  private generateWhyChooseUs(businessType: string, yearsInBusiness: number | null, teamSize: number | null) {
    const reasons = [];

    // Expérience
    if (yearsInBusiness) {
      reasons.push({
        icon: '⭐',
        title: `${yearsInBusiness}+ ans d'expérience`,
        description: `Une expertise éprouvée et une connaissance approfondie du secteur ${businessType}.`
      });
    }

    // Équipe
    if (teamSize) {
      reasons.push({
        icon: '👥',
        title: `${teamSize} professionnels qualifiés`,
        description: 'Une équipe passionnée, formée aux dernières techniques et à votre écoute.'
      });
    }

    // Qualité
    reasons.push({
      icon: '✨',
      title: 'Qualité Premium',
      description: this.getQualityStatement(businessType)
    });

    // Service client
    reasons.push({
      icon: '💎',
      title: 'Service Personnalisé',
      description: 'Chaque client est unique. Nous adaptons notre service à vos besoins spécifiques.'
    });

    // Garantie
    reasons.push({
      icon: '🛡️',
      title: 'Garantie Satisfaction',
      description: 'Votre satisfaction est notre priorité absolue. Satisfait ou remboursé.'
    });

    // Prix
    reasons.push({
      icon: '💰',
      title: 'Rapport Qualité-Prix',
      description: 'Des tarifs justes et transparents pour un service d\'exception.'
    });

    return reasons;
  }

  /**
   * Génère le process détaillé
   */
  private generateProcess(businessType: string) {
    const processes = {
      parfum: [
        { step: 1, title: 'Accueil Personnalisé', description: 'Nous prenons le temps de vous connaître et comprendre vos goûts', duration: '10 min' },
        { step: 2, title: 'Découverte Olfactive', description: 'Test de différentes familles pour identifier vos préférences', duration: '15 min' },
        { step: 3, title: 'Sélection Sur-Mesure', description: 'Présentation de parfums parfaitement adaptés à votre profil', duration: '15 min' },
        { step: 4, title: 'Essai et Décision', description: 'Test sur peau avec échantillons offerts pour confirmer chez vous', duration: '10 min' }
      ],
      restaurant: [
        { step: 1, title: 'Réservation', description: 'Réservez en ligne ou par téléphone, confirmation immédiate', duration: '2 min' },
        { step: 2, title: 'Accueil Chaleureux', description: 'Notre équipe vous accueille et vous installe confortablement', duration: '5 min' },
        { step: 3, title: 'Conseil Menu', description: 'Présentation de notre carte et recommandations du chef', duration: '10 min' },
        { step: 4, title: 'Service Attentif', description: 'Dégustation de vos plats avec un service irréprochable', duration: 'Variable' }
      ],
      cafe: [
        { step: 1, title: 'Bienvenue', description: 'Accueil souriant dans une ambiance cosy', duration: 'Immédiat' },
        { step: 2, title: 'Commande', description: 'Conseil personnalisé sur nos cafés et pâtisseries', duration: '3 min' },
        { step: 3, title: 'Préparation Expert', description: 'Nos baristas préparent votre boisson avec soin', duration: '5 min' },
        { step: 4, title: 'Dégustation', description: 'Savourez dans notre espace confortable', duration: 'À votre rythme' }
      ],
      coiffure: [
        { step: 1, title: 'Prise de Rendez-vous', description: 'Réservation en ligne rapide et simple', duration: '2 min' },
        { step: 2, title: 'Consultation', description: 'Diagnostic capillaire et conseil personnalisé', duration: '10 min' },
        { step: 3, title: 'Réalisation', description: 'Coupe, coloration ou soin par un expert', duration: 'Selon prestation' },
        { step: 4, title: 'Finitions & Conseils', description: 'Brushing et conseils d\'entretien personnalisés', duration: '15 min' }
      ],
      immobilier: [
        { step: 1, title: 'Premier Contact', description: 'Échange sur votre projet et vos critères', duration: '30 min' },
        { step: 2, title: 'Recherche & Sélection', description: 'Nous trouvons les biens correspondant parfaitement', duration: '1-2 semaines' },
        { step: 3, title: 'Visites Accompagnées', description: 'Visites avec conseils d\'expert et négociation', duration: 'Variable' },
        { step: 4, title: 'Finalisation', description: 'Accompagnement jusqu\'à la signature et au-delà', duration: '2-3 mois' }
      ]
    };

    return {
      title: 'Notre Processus en 4 Étapes',
      description: 'Une méthode éprouvée pour garantir votre satisfaction',
      steps: processes[businessType] || []
    };
  }

  /**
   * Génère les garanties et engagements
   */
  private generateGuarantees(businessType: string) {
    return [
      {
        icon: '✅',
        title: 'Satisfaction Garantie',
        description: 'Si vous n\'êtes pas entièrement satisfait, nous trouvons une solution ou vous remboursons.'
      },
      {
        icon: '🔒',
        title: 'Paiement Sécurisé',
        description: 'Transactions 100% sécurisées avec les dernières technologies de cryptage.'
      },
      {
        icon: '📞',
        title: 'Support Réactif',
        description: 'Notre équipe est disponible pour répondre à toutes vos questions rapidement.'
      },
      {
        icon: '♻️',
        title: 'Politique Retour Flexible',
        description: this.getReturnPolicy(businessType)
      },
      {
        icon: '🎁',
        title: 'Programme Fidélité',
        description: 'Récompenses et avantages exclusifs pour nos clients réguliers.'
      }
    ];
  }

  /**
   * Génère la section équipe
   */
  private generateTeamSection(businessType: string, teamSize: number | null) {
    if (!teamSize) return null;

    const roles = this.getTeamRoles(businessType);
    const members = roles.slice(0, Math.min(4, teamSize)).map((role, index) => ({
      name: `Membre ${index + 1}`,
      role: role.title,
      bio: role.description,
      experience: `${5 + index * 2}+ ans`,
      specialties: role.specialties
    }));

    return {
      title: 'Notre Équipe',
      description: `${teamSize} professionnels passionnés à votre service`,
      members,
      joinText: teamSize > 4 ? `Et ${teamSize - 4} autres talents qui font la différence chaque jour !` : null
    };
  }

  /**
   * Génère les zones desservies
   */
  private generateServiceAreas(city: string, businessType: string) {
    const mainCity = city;
    const surroundingAreas = this.getSurroundingAreas(city);

    return {
      mainArea: {
        city: mainCity,
        description: `Présents au cœur de ${mainCity}`,
        services: 'Tous nos services disponibles'
      },
      delivery: businessType === 'restaurant' || businessType === 'cafe' || businessType === 'parfum' ? {
        enabled: true,
        areas: surroundingAreas,
        freeDeliveryThreshold: 50,
        deliveryFee: 5
      } : null,
      serviceRadius: {
        radius: 20,
        description: `Nous intervenons dans un rayon de 20km autour de ${mainCity}`
      }
    };
  }

  /**
   * Génère les horaires d'ouverture
   */
  private generateOpeningHours(businessType: string) {
    const schedules = {
      parfum: { weekday: { open: '10:00', close: '19:00' }, saturday: { open: '10:00', close: '19:00' }, sunday: 'closed' },
      restaurant: { weekday: { open: '12:00', close: '22:00' }, saturday: { open: '12:00', close: '23:00' }, sunday: { open: '12:00', close: '22:00' } },
      cafe: { weekday: { open: '07:30', close: '19:00' }, saturday: { open: '08:00', close: '19:00' }, sunday: { open: '08:30', close: '18:00' } },
      coiffure: { weekday: { open: '09:00', close: '19:00' }, saturday: { open: '09:00', close: '18:00' }, sunday: 'closed' },
      immobilier: { weekday: { open: '09:00', close: '18:00' }, saturday: { open: '09:00', close: '12:00' }, sunday: 'closed' }
    };

    const schedule = schedules[businessType] || schedules.parfum;

    return [
      { day: 'Lundi', ...schedule.weekday, isClosed: false },
      { day: 'Mardi', ...schedule.weekday, isClosed: false },
      { day: 'Mercredi', ...schedule.weekday, isClosed: false },
      { day: 'Jeudi', ...schedule.weekday, isClosed: false },
      { day: 'Vendredi', ...schedule.weekday, isClosed: false },
      { day: 'Samedi', ...(typeof schedule.saturday === 'string' ? { isClosed: true } : { ...schedule.saturday, isClosed: false }) },
      { day: 'Dimanche', ...(typeof schedule.sunday === 'string' ? { isClosed: true } : { ...schedule.sunday, isClosed: false }) }
    ];
  }

  /**
   * Génère des offres saisonnières
   */
  private generateSeasonalOffers(businessType: string, city: string) {
    const month = new Date().getMonth() + 1;
    const season = month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter';

    const offers = {
      spring: {
        title: 'Offres Printemps',
        description: 'Profitez de nos promotions de saison',
        discount: '-20%',
        validUntil: '31 Mai 2024'
      },
      summer: {
        title: 'Soldes d\'Été',
        description: 'Jusqu\'à -30% sur une sélection',
        discount: '-30%',
        validUntil: '31 Août 2024'
      },
      autumn: {
        title: 'Rentrée',
        description: 'Offres spéciales rentrée',
        discount: '-15%',
        validUntil: '30 Septembre 2024'
      },
      winter: {
        title: 'Fêtes de Fin d\'Année',
        description: 'Offrez le meilleur',
        discount: '-25%',
        validUntil: '31 Décembre 2024'
      }
    };

    return offers[season];
  }

  /**
   * Génère un email de bienvenue personnalisé
   */
  private generateWelcomeEmail(companyName: string, businessType: string, email: string | null) {
    return {
      subject: `Bienvenue chez ${companyName} !`,
      preview: 'Merci de votre confiance, découvrez nos services',
      body: `
        Bonjour et bienvenue chez ${companyName} !
        
        Nous sommes ravis de vous compter parmi nos clients.
        
        ${this.getWelcomeMessage(businessType)}
        
        N'hésitez pas à nous contacter pour toute question.
        
        À très bientôt,
        L'équipe ${companyName}
      `,
      cta: {
        text: this.getWelcomeCTA(businessType),
        url: '#contact'
      }
    };
  }

  /**
   * Génère des métadonnées enrichies
   */
  private generateEnrichedMeta(data: any, yearsInBusiness: number | null) {
    const { companyName, city, businessType, phone, email, address } = data;

    return {
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': companyName,
        'image': `https://example.com/images/${this.slugify(companyName)}.jpg`,
        'telephone': phone,
        'email': email,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': address || '',
          'addressLocality': city,
          'addressCountry': 'FR'
        },
        'geo': this.getCityCoordinates(city),
        'openingHoursSpecification': this.getStructuredHours(businessType),
        'priceRange': this.getPriceRange(businessType),
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.8',
          'reviewCount': yearsInBusiness ? yearsInBusiness * 50 : 100
        }
      },
      openGraph: {
        'og:title': `${companyName} - ${businessType} à ${city}`,
        'og:description': `${this.getOGDescription(businessType, companyName, city)}`,
        'og:type': 'business.business',
        'og:locale': 'fr_FR',
        'og:site_name': companyName
      }
    };
  }

  // Helper methods
  private formatPhone(phone: string): string {
    return phone.replace(/(\d{2})(?=\d)/g, '$1 ');
  }

  private slugify(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  }

  private getCityCoordinates(city: string) {
    // Simplified - in production, use a geocoding API
    return { latitude: 48.8566, longitude: 2.3522 };
  }

  private getBusinessObjective(businessType: string): string {
    const objectives = {
      parfum: 'trouver votre parfum signature',
      restaurant: 'passer un moment gastronomique inoubliable',
      cafe: 'savourer les meilleurs cafés',
      coiffure: 'sublimer votre style',
      immobilier: 'concrétiser votre projet immobilier'
    };
    return objectives[businessType] || 'réaliser votre projet';
  }

  private getValueHeadline(businessType: string, specialties: string[]): string {
    if (specialties.length > 0) {
      return `Experts en ${specialties[0]} et bien plus encore`;
    }
    return `L'excellence ${businessType} à votre service`;
  }

  private getValueSubheadline(businessType: string): string {
    return `nous redéfinissons les standards de qualité et de service`;
  }

  private getUniquebenefits(businessType: string, specialties: string[]): string[] {
    return [
      'Service personnalisé et sur-mesure',
      'Expertise reconnue et certifiée',
      'Satisfaits garantie à 100%',
      specialties[0] ? `Spécialistes en ${specialties[0]}` : 'Produits/services premium',
      'Équipe passionnée et formée'
    ];
  }

  private getDifferentiators(businessType: string): string[] {
    return [
      'Prix justes et transparents',
      'Disponibilité et réactivité',
      'Suivi personnalisé',
      'Technologies de pointe'
    ];
  }

  private getClientCount(years: number): number {
    return years * 150;
  }

  private getQualityStatement(businessType: string): string {
    return 'Nous utilisons uniquement des produits et techniques de qualité supérieure pour garantir votre satisfaction.';
  }

  private getReturnPolicy(businessType: string): string {
    return 'Retour facile et remboursement rapide selon conditions. Votre satisfaction est prioritaire.';
  }

  private getTeamRoles(businessType: string) {
    const roles = {
      parfum: [
        { title: 'Expert Parfumeur', description: 'Spécialiste des fragrances', specialties: ['Conseil', 'Création'] },
        { title: 'Conseiller', description: 'À votre écoute', specialties: ['Accueil', 'Vente'] }
      ],
      restaurant: [
        { title: 'Chef Cuisinier', description: 'Créateur de saveurs', specialties: ['Cuisine', 'Innovation'] },
        { title: 'Chef de Salle', description: 'Service d\'excellence', specialties: ['Accueil', 'Conseil'] }
      ],
      coiffure: [
        { title: 'Coiffeur Expert', description: 'Maître des ciseaux', specialties: ['Coupe', 'Coloration'] },
        { title: 'Styliste', description: 'Créateur de style', specialties: ['Tendances', 'Conseil'] }
      ]
    };
    return roles[businessType] || [];
  }

  private getSurroundingAreas(city: string): string[] {
    // Simplified - in production, use geographic data
    return [`${city} Centre`, `${city} Nord`, `${city} Sud`, 'Banlieue proche'];
  }

  private getStructuredHours(businessType: string) {
    // Simplified structured hours for schema.org
    return [];
  }

  private getPriceRange(businessType: string): string {
    const ranges = {
      parfum: '€€€',
      restaurant: '€€-€€€',
      cafe: '€-€€',
      coiffure: '€€',
      immobilier: 'Variable'
    };
    return ranges[businessType] || '€€';
  }

  private getOGDescription(businessType: string, companyName: string, city: string): string {
    return `Découvrez ${companyName}, votre ${businessType} de référence à ${city}. Excellence, qualité et service personnalisé.`;
  }

  private getWelcomeMessage(businessType: string): string {
    return `En tant que spécialiste ${businessType}, nous mettons notre expertise à votre service pour vous offrir une expérience exceptionnelle.`;
  }

  private getWelcomeCTA(businessType: string): string {
    const ctas = {
      parfum: 'Découvrez notre collection',
      restaurant: 'Réservez votre table',
      cafe: 'Visitez-nous',
      coiffure: 'Prenez rendez-vous',
      immobilier: 'Contactez un conseiller'
    };
    return ctas[businessType] || 'En savoir plus';
  }
}
