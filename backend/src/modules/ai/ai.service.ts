import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async optimizeProductDescription(title: string, currentDescription: string): Promise<string> {
    if (!this.genAI) {
      return currentDescription || `Description professionnelle pour ${title}`;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `En tant qu'expert en e-commerce tunisien, réécris une description produit persuasive, riche en mots-clés SEO et structurée pour le produit suivant :
Titre : ${title}
Description actuelle : ${currentDescription || 'Aucune'}

Format de réponse souhaité : HTML propre avec des balises <h3> et <ul>. Utilise un ton professionnel et engageant.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Erreur lors de l\'optimisation IA:', error);
      return currentDescription;
    }
  }

  async suggestProductTags(title: string, description: string): Promise<string[]> {
    if (!this.genAI) return [];

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Génère 5 tags (mots-clés) pertinents pour ce produit e-commerce en Tunisie :
Titre : ${title}
Description : ${description}

Réponds uniquement avec les mots-clés séparés par des virgules.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().split(',').map(tag => tag.trim());
    } catch (error) {
      return [];
    }
  }
}
