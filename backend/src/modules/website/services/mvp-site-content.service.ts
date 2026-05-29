import { Injectable, Logger } from '@nestjs/common';

/** Contenu statique FR — remplace Gemini/IA (module ai archivé). */
@Injectable()
export class MvpSiteContentService {
  private readonly logger = new Logger(MvpSiteContentService.name);

  async generateUltraPersonalizedContent(context: {
    name: string;
    type?: string;
    description?: string;
    location?: string;
    targetAudience?: string;
    uniqueSellingPoints?: string[];
  }) {
    this.logger.log(`Contenu MVP (sans IA) pour ${context.name}`);
    const usp = context.uniqueSellingPoints?.[0] || 'Qualité et service client';
    return {
      hero: {
        headline: `Bienvenue chez ${context.name}`,
        subheadline: context.description || `Votre boutique en ligne en Tunisie — ${usp}`,
        primaryCta: 'Voir les produits',
        secondaryCta: 'Nous contacter',
      },
      about: {
        title: `À propos de ${context.name}`,
        story: `${context.name} propose des produits sélectionnés avec livraison en Tunisie et paiement à la livraison (COD).`,
        mission: 'Satisfaire nos clients avec des produits de qualité.',
        vision: 'Devenir une référence e-commerce locale.',
        values: ['Qualité', 'Rapidité', 'Transparence', 'Service client'],
      },
      testimonials: [],
      faq: [
        { question: 'Livrez-vous en Tunisie ?', answer: 'Oui, dans les 24 gouvernorats.' },
        { question: 'Puis-je payer à la livraison ?', answer: 'Oui, le COD est disponible.' },
      ],
      seo: {
        title: `${context.name} — Boutique en ligne Tunisie`,
        description: context.description || `Achetez chez ${context.name} avec livraison rapide.`,
      },
    };
  }
}
