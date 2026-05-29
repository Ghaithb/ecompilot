import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface RasaResponse {
  recipient_id: string;
  text?: string;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  quick_replies?: string[];
  custom?: any;
}

export interface RasaMessage {
  sender: string;
  message: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class RasaClientService {
  private readonly logger = new Logger(RasaClientService.name);
  private rasaClient: AxiosInstance;
  private rasaUrl: string;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.rasaUrl = this.configService.get<string>('RASA_SERVER_URL', 'http://localhost:5005');
    this.isConfigured = false;
    
    this.rasaClient = axios.create({
      baseURL: this.rasaUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialiser la connexion de manière asynchrone
    this.initializeConnection();
  }

  /**
   * Initialise la connexion au serveur Rasa
   */
  private async initializeConnection(): Promise<void> {
    try {
      const isAvailable = await this.checkRasaAvailability();
      this.isConfigured = isAvailable;
      
      if (this.isConfigured) {
        this.logger.log(`✅ Rasa Client configuré: ${this.rasaUrl}`);
      } else {
        this.logger.warn('⚠️ Rasa Server non configuré - Mode simulation activé');
      }
    } catch (error) {
      this.logger.warn('⚠️ Impossible de se connecter à Rasa - Mode simulation activé');
    }
  }

  /**
   * Vérifie si le serveur Rasa est disponible
   */
  private async checkRasaAvailability(): Promise<boolean> {
    try {
      await axios.get(`${this.rasaUrl}/status`, { timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Envoie un message au serveur Rasa
   */
  async sendMessage(rasaMessage: RasaMessage): Promise<RasaResponse[]> {
    try {
      if (!this.isConfigured) {
        return this.getSimulatedResponse(rasaMessage);
      }

      const response = await this.rasaClient.post('/webhooks/rest/webhook', {
        sender: rasaMessage.sender,
        message: rasaMessage.message,
        metadata: rasaMessage.metadata,
      });

      this.logger.debug(`Message envoyé à Rasa: ${rasaMessage.message}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur Rasa: ${error.message}`);
      
      // Fallback vers simulation en cas d'erreur
      return this.getSimulatedResponse(rasaMessage);
    }
  }

  /**
   * Récupère le tracker d'une conversation
   */
  async getTracker(conversationId: string): Promise<any> {
    try {
      if (!this.isConfigured) {
        return this.getSimulatedTracker(conversationId);
      }

      const response = await this.rasaClient.get(`/conversations/${conversationId}/tracker`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur récupération tracker: ${error.message}`);
      return this.getSimulatedTracker(conversationId);
    }
  }

  /**
   * Entraîne le modèle Rasa
   */
  async trainModel(): Promise<any> {
    try {
      if (!this.isConfigured) {
        throw new HttpException(
          'Rasa Server non configuré',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const response = await this.rasaClient.post('/model/train', {
        save_to_default_model_directory: true,
      });

      this.logger.log('✅ Entraînement du modèle Rasa lancé');
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur entraînement: ${error.message}`);
      throw new HttpException(
        'Échec de l\'entraînement du modèle',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère la liste des intents disponibles
   */
  async getIntents(): Promise<string[]> {
    try {
      if (!this.isConfigured) {
        return this.getSimulatedIntents();
      }

      const response = await this.rasaClient.get('/domain');
      return response.data.intents || [];
    } catch (error) {
      this.logger.error(`Erreur récupération intents: ${error.message}`);
      return this.getSimulatedIntents();
    }
  }

  /**
   * Health check du serveur Rasa
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      const response = await this.rasaClient.get('/status');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse la réponse Rasa en format unifié
   */
  parseRasaResponse(rasaResponses: RasaResponse[]): any[] {
    return rasaResponses.map((response) => ({
      text: response.text,
      buttons: response.buttons,
      quickReplies: response.quick_replies,
      custom: response.custom,
    }));
  }

  // ==================== MÉTHODES DE SIMULATION ====================

  /**
   * Génère une réponse simulée pour les tests
   */
  private getSimulatedResponse(message: RasaMessage): RasaResponse[] {
    const text = message.message.toLowerCase();
    
    let responseText = '';
    let intent = 'unknown';
    let confidence = 0.85;

    // Simulation de reconnaissance d'intents
    if (text.includes('commande') || text.includes('order')) {
      intent = 'track_order';
      responseText = '🤖 Je peux vous aider à suivre votre commande. Quel est votre numéro de commande ?';
    } else if (text.includes('produit') || text.includes('article')) {
      intent = 'product_info';
      responseText = '🤖 Nous avons une large gamme de produits. Que recherchez-vous exactement ?';
    } else if (text.includes('prix') || text.includes('coût')) {
      intent = 'ask_price';
      responseText = '🤖 Les prix varient selon les produits. Pouvez-vous me donner plus de détails sur ce qui vous intéresse ?';
    } else if (text.includes('livraison') || text.includes('shipping')) {
      intent = 'shipping_info';
      responseText = '🤖 Nous offrons la livraison dans toute l\'Afrique. Les délais sont de 2-5 jours ouvrables.';
    } else if (text.includes('paiement') || text.includes('payment')) {
      intent = 'payment_methods';
      responseText = '🤖 Nous acceptons Orange Money, MTN Money, Wave, cartes bancaires et paiement à la livraison.';
    } else if (text.includes('bonjour') || text.includes('salut') || text.includes('hello')) {
      intent = 'greet';
      responseText = '🤖 Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?';
    } else if (text.includes('merci') || text.includes('thank')) {
      intent = 'thank';
      responseText = '🤖 De rien ! N\'hésitez pas si vous avez d\'autres questions.';
    } else if (text.includes('au revoir') || text.includes('bye')) {
      intent = 'goodbye';
      responseText = '🤖 Au revoir ! Passez une excellente journée ! 👋';
    } else {
      intent = 'fallback';
      confidence = 0.45;
      responseText = '🤖 Je comprends votre question. Laissez-moi vous aider avec cela. Pouvez-vous me donner plus de détails ?';
    }

    return [
      {
        recipient_id: message.sender,
        text: `${responseText}\n\n💡 [Mode Simulation - Connectez un serveur Rasa réel pour des réponses intelligentes]`,
        custom: {
          intent,
          confidence,
          mode: 'simulation',
        },
      },
    ];
  }

  /**
   * Génère un tracker simulé
   */
  private getSimulatedTracker(conversationId: string): any {
    return {
      sender_id: conversationId,
      slots: {},
      latest_message: {
        intent: { name: 'greet', confidence: 0.95 },
        entities: [],
      },
      events: [],
      paused: false,
      followup_action: null,
      active_loop: {},
      latest_action_name: 'action_listen',
    };
  }

  /**
   * Retourne la liste des intents simulés
   */
  private getSimulatedIntents(): string[] {
    return [
      'greet',
      'goodbye',
      'affirm',
      'deny',
      'track_order',
      'product_info',
      'payment_methods',
      'shipping_info',
      'ask_price',
      'complaint',
      'recommend_product',
      'place_order',
      'thank',
      'fallback',
    ];
  }
}
