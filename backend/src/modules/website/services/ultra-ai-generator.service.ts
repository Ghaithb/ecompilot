import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface BusinessContext {
  type: string;
  name: string;
  description?: string;
  location?: string;
  targetAudience?: string;
  uniqueSellingPoints?: string[];
  competitors?: string[];
  goals?: string[];
}

interface GeneratedContent {
  hero: {
    headline: string;
    subheadline: string;
    cta: string[];
    backgroundStyle: string;
  };
  about: {
    title: string;
    story: string;
    mission: string;
    vision: string;
    values: string[];
  };
  services: Array<{
    name: string;
    description: string;
    features: string[];
    icon: string;
    price?: string;
  }>;
  testimonials: Array<{
    text: string;
    author: string;
    role: string;
    rating: number;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  blog: Array<{
    title: string;
    excerpt: string;
    content: string;
    category: string;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  designTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontPrimary: string;
    fontSecondary: string;
    mood: string; // elegant, modern, playful, professional
  };
  animations: {
    heroStyle: string; // fade, slide, zoom, parallax
    scrollEffects: string[]; // reveal, parallax, counter, morphing
    transitions: string; // smooth, bouncy, elastic
  };
}

@Injectable()
export class UltraAIGeneratorService {
  private readonly logger = new Logger(UltraAIGeneratorService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  /**
   * Génère un contenu complet ultra-personnalisé avec IA
   */
  async generateUltraPersonalizedContent(context: BusinessContext): Promise<GeneratedContent> {
    this.logger.log(`🎨 Génération IA ultra-personnalisée pour: ${context.name}`);

    const prompt = this.buildIntelligentPrompt(context);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parser la réponse JSON
      const content = this.parseAIResponse(response, context);
      
      this.logger.log(`✅ Contenu IA généré avec succès`);
      return content;
    } catch (error) {
      this.logger.error(`Erreur génération IA: ${error.message}`);
      return this.getFallbackContent(context);
    }
  }

  /**
   * Construit un prompt ultra-intelligent
   */
  private buildIntelligentPrompt(context: BusinessContext): string {
    return `Tu es un expert en marketing digital, copywriting, et design web. Tu vas créer un contenu EXCEPTIONNEL pour un site web professionnel.

CONTEXTE BUSINESS:
- Type: ${context.type}
- Nom: ${context.name}
- Description: ${context.description || 'À définir'}
- Localisation: ${context.location || 'International'}
- Audience cible: ${context.targetAudience || 'Grand public'}
- Points forts: ${context.uniqueSellingPoints?.join(', ') || 'Qualité, Service, Innovation'}
- Objectifs: ${context.goals?.join(', ') || 'Augmenter les ventes, Fidéliser les clients'}

MISSION:
Génère un contenu WEB ULTRA-PREMIUM avec:

1. HERO SECTION (Accrocheur et impactant)
   - Headline émotionnelle qui capte l'attention en 3 secondes
   - Subheadline qui explique la valeur unique
   - 2 CTAs puissants (primaire + secondaire)
   - Style visuel recommandé (gradient, image, vidéo, 3D)

2. À PROPOS (Histoire captivante)
   - Titre engageant
   - Histoire authentique et émotionnelle (150 mots)
   - Mission claire et inspirante
   - Vision ambitieuse
   - 4-5 valeurs fondamentales

3. STRUCTURE SERVICES/PRODUITS
   - NE GÉNÈRE PAS de produits/services fictifs
   - Le chef de site ajoutera ses VRAIS produits
   - Génère seulement le titre de section et description

4. TÉMOIGNAGES (5 témoignages authentiques)
   - Texte réaliste et spécifique (30-50 mots)
   - Nom complet crédible
   - Rôle/profession
   - Note sur 5

5. FAQ (8 questions essentielles)
   - Questions que se posent VRAIMENT les clients
   - Réponses complètes et rassurantes (80-100 mots)

6. BLOG (3 articles)
   - Titres accrocheurs et SEO
   - Résumés engageants (100 mots)
   - Contenu complet (300 mots)
   - Catégories pertinentes

7. SEO (Optimisation maximale)
   - Meta title parfait (60 caractères)
   - Meta description irrésistible (155 caractères)
   - 10 mots-clés stratégiques

8. THÈME DESIGN (Psychologie des couleurs)
   - Couleur primaire (HEX)
   - Couleur secondaire (HEX)
   - Couleur d'accent (HEX)
   - Police principale (Google Fonts)
   - Police secondaire
   - Mood général (elegant/modern/playful/professional)

9. ANIMATIONS (Effets visuels)
   - Style hero (fade/slide/zoom/parallax)
   - 3-5 effets de scroll recommandés
   - Type de transitions (smooth/bouncy/elastic)

INSTRUCTIONS CRITIQUES:
✅ Sois CRÉATIF et ORIGINAL - évite les clichés
✅ Utilise un ton ADAPTÉ au type de business
✅ Pense CONVERSION et ENGAGEMENT
✅ Intègre des ÉMOTIONS et du STORYTELLING
✅ Optimise pour le SEO
✅ Assure la cohérence de marque
✅ Propose des visuels modernes et tendances

RETOURNE UN JSON VALIDE avec cette structure EXACTE:
{
  "hero": {
    "headline": "...",
    "subheadline": "...",
    "cta": ["CTA1", "CTA2"],
    "backgroundStyle": "gradient/image/video/3d"
  },
  "about": {
    "title": "...",
    "story": "...",
    "mission": "...",
    "vision": "...",
    "values": ["...", "..."]
  },
  "services": [
    {
      "name": "...",
      "description": "...",
      "features": ["...", "...", "..."],
      "icon": "emoji",
      "price": "XX€"
    }
  ],
  "testimonials": [
    {
      "text": "...",
      "author": "Prénom Nom",
      "role": "...",
      "rating": 5
    }
  ],
  "faq": [
    {
      "question": "...",
      "answer": "..."
    }
  ],
  "blog": [
    {
      "title": "...",
      "excerpt": "...",
      "content": "...",
      "category": "..."
    }
  ],
  "seo": {
    "title": "...",
    "description": "...",
    "keywords": ["...", "..."]
  },
  "designTheme": {
    "primaryColor": "#HEXCODE",
    "secondaryColor": "#HEXCODE",
    "accentColor": "#HEXCODE",
    "fontPrimary": "Font Name",
    "fontSecondary": "Font Name",
    "mood": "elegant/modern/playful/professional"
  },
  "animations": {
    "heroStyle": "fade/slide/zoom/parallax",
    "scrollEffects": ["reveal", "counter", "..."],
    "transitions": "smooth/bouncy/elastic"
  }
}`;
  }

  /**
   * Parse la réponse IA
   */
  private parseAIResponse(response: string, context: BusinessContext): GeneratedContent {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (error) {
      this.logger.warn('Erreur parsing JSON, utilisation fallback');
    }
    
    return this.getFallbackContent(context);
  }

  /**
   * Contenu de secours intelligent
   */
  private getFallbackContent(context: BusinessContext): GeneratedContent {
    const businessTypeContent = this.getBusinessTypeDefaults(context.type);
    
    return {
      hero: {
        headline: `${context.name} - ${businessTypeContent.tagline}`,
        subheadline: businessTypeContent.subheadline,
        cta: ['Découvrir', 'Nous Contacter'],
        backgroundStyle: 'gradient',
      },
      about: {
        title: `À Propos de ${context.name}`,
        story: `${context.name} est ${businessTypeContent.story}`,
        mission: businessTypeContent.mission,
        vision: businessTypeContent.vision,
        values: ['Excellence', 'Innovation', 'Satisfaction Client', 'Intégrité'],
      },
      services: businessTypeContent.services,
      testimonials: [
        {
          text: 'Service exceptionnel ! Je recommande vivement.',
          author: 'Sophie Martin',
          role: 'Cliente satisfaite',
          rating: 5,
        },
        {
          text: 'Qualité irréprochable et équipe professionnelle.',
          author: 'Thomas Dubois',
          role: 'Client régulier',
          rating: 5,
        },
        {
          text: 'Meilleure expérience que j\'ai eue. Bravo !',
          author: 'Marie Laurent',
          role: 'Cliente fidèle',
          rating: 5,
        },
      ],
      faq: businessTypeContent.faq,
      blog: businessTypeContent.blog,
      seo: {
        title: `${context.name} - ${businessTypeContent.seoTitle}`,
        description: businessTypeContent.seoDescription,
        keywords: businessTypeContent.keywords,
      },
      designTheme: businessTypeContent.design,
      animations: {
        heroStyle: 'parallax',
        scrollEffects: ['reveal', 'counter', 'parallax', 'morphing'],
        transitions: 'smooth',
      },
    };
  }

  /**
   * Contenus par défaut selon le type de business
   */
  private getBusinessTypeDefaults(type: string) {
    const defaults = {
      ecommerce: {
        tagline: 'Votre Boutique en Ligne de Confiance',
        subheadline: 'Découvrez nos produits de qualité premium',
        story: 'votre destination shopping en ligne, offrant une sélection soigneusement choisie de produits exceptionnels.',
        mission: 'Offrir une expérience d\'achat incomparable avec des produits de qualité',
        vision: 'Devenir la référence du e-commerce en Afrique',
        services: [
          {
            name: 'Produits Premium',
            description: 'Sélection rigoureuse de produits haut de gamme',
            features: ['Qualité garantie', 'Prix compétitifs', 'Stock permanent'],
            icon: '🛍️',
            price: 'À partir de 29€',
          },
          {
            name: 'Livraison Express',
            description: 'Recevez vos commandes rapidement partout',
            features: ['24-48h', 'Suivi en temps réel', 'Livraison gratuite dès 50€'],
            icon: '🚀',
            price: 'Dès 5€',
          },
          {
            name: 'Service Client 24/7',
            description: 'Une équipe dédiée à votre service',
            features: ['Disponible H24', 'Support multicanal', 'Réponse rapide'],
            icon: '💬',
            price: 'Gratuit',
          },
        ],
        faq: [
          {
            question: 'Quels sont les délais de livraison ?',
            answer: 'Nous livrons en 24-48h dans toute la France métropolitaine. Pour les autres destinations, comptez 3-5 jours ouvrés.',
          },
          {
            question: 'Puis-je retourner un produit ?',
            answer: 'Oui, vous disposez de 14 jours pour retourner tout produit non ouvert. Les frais de retour sont à votre charge.',
          },
        ],
        blog: [
          {
            title: 'Guide d\'achat 2024',
            excerpt: 'Découvrez nos meilleures recommandations pour cette année',
            content: 'Contenu complet...',
            category: 'Guides',
          },
        ],
        seoTitle: 'E-commerce de Qualité | Livraison Rapide',
        seoDescription: 'Achetez en ligne des produits de qualité premium. Livraison express 24-48h. Satisfait ou remboursé.',
        keywords: ['e-commerce', 'boutique en ligne', 'achats', 'livraison rapide', 'qualité'],
        design: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          accentColor: '#F59E0B',
          fontPrimary: 'Inter',
          fontSecondary: 'Poppins',
          mood: 'modern',
        },
      },
      restaurant: {
        tagline: 'L\'Art de la Gastronomie',
        subheadline: 'Une expérience culinaire inoubliable',
        story: 'un restaurant passionné par l\'excellence gastronomique et l\'accueil chaleureux.',
        mission: 'Créer des moments culinaires mémorables avec des ingrédients frais et locaux',
        vision: 'Devenir la destination gastronomique incontournable de la région',
        services: [
          {
            name: 'Menu Gastronomique',
            description: 'Cuisine raffinée avec des produits du terroir',
            features: ['Ingrédients frais', 'Chef étoilé', 'Carte des vins'],
            icon: '🍽️',
            price: 'À partir de 45€',
          },
          {
            name: 'Événements Privés',
            description: 'Privatisation pour vos occasions spéciales',
            features: ['Menu sur mesure', 'Décoration incluse', 'Service dédié'],
            icon: '🎉',
            price: 'Sur devis',
          },
          {
            name: 'Réservation en Ligne',
            description: 'Réservez votre table en quelques clics',
            features: ['Disponibilité temps réel', 'Confirmation immédiate', 'Modification facile'],
            icon: '📱',
            price: 'Gratuit',
          },
        ],
        faq: [
          {
            question: 'Acceptez-vous les réservations ?',
            answer: 'Oui, nous recommandons fortement de réserver, surtout le week-end. Vous pouvez réserver en ligne ou par téléphone.',
          },
          {
            question: 'Avez-vous des options végétariennes ?',
            answer: 'Absolument ! Notre carte propose plusieurs options végétariennes et véganes. Notre chef peut également adapter les plats selon vos besoins.',
          },
        ],
        blog: [
          {
            title: 'Les Secrets de Notre Chef',
            excerpt: 'Découvrez les techniques culinaires de notre chef étoilé',
            content: 'Contenu complet...',
            category: 'Cuisine',
          },
        ],
        seoTitle: 'Restaurant Gastronomique | Cuisine Raffinée',
        seoDescription: 'Restaurant gastronomique avec chef étoilé. Produits frais et locaux. Réservation en ligne. Événements privés.',
        keywords: ['restaurant', 'gastronomie', 'cuisine', 'chef étoilé', 'terroir'],
        design: {
          primaryColor: '#1F2937',
          secondaryColor: '#D97706',
          accentColor: '#EF4444',
          fontPrimary: 'Playfair Display',
          fontSecondary: 'Lato',
          mood: 'elegant',
        },
      },
      // Ajouter d'autres types de business...
    };

    return defaults[type] || defaults.ecommerce;
  }

  /**
   * Génère des variations de contenu pour A/B testing
   */
  async generateContentVariations(context: BusinessContext, count: number = 3): Promise<GeneratedContent[]> {
    const variations: GeneratedContent[] = [];
    
    for (let i = 0; i < count; i++) {
      const content = await this.generateUltraPersonalizedContent({
        ...context,
        goals: [...(context.goals || []), `Variation ${i + 1}`],
      });
      variations.push(content);
    }
    
    return variations;
  }

  /**
   * Analyse et optimise le contenu existant
   */
  async optimizeContent(currentContent: string, goals: string[]): Promise<string> {
    const prompt = `Analyse ce contenu de site web et propose 5 améliorations concrètes pour ${goals.join(', ')}:\n\n${currentContent}`;
    
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return 'Optimisations recommandées: 1) Améliorer les CTAs 2) Renforcer la proposition de valeur 3) Ajouter des preuves sociales 4) Optimiser pour mobile 5) Clarifier les bénéfices';
    }
  }
}
