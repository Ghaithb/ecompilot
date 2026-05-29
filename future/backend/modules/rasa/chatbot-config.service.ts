import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatbotConfig, ChatbotConfigDocument } from './schemas/chatbot-config.schema';

@Injectable()
export class ChatbotConfigService {
  private readonly logger = new Logger(ChatbotConfigService.name);

  constructor(
    @InjectModel(ChatbotConfig.name)
    private chatbotConfigModel: Model<ChatbotConfigDocument>,
  ) {}

  /**
   * Récupère la configuration du chatbot pour un tenant
   */
  async getConfig(tenantId: string): Promise<ChatbotConfig> {
    const config = await this.chatbotConfigModel.findOne({ tenantId });
    
    if (!config) {
      // Créer une configuration par défaut
      return this.createDefaultConfig(tenantId);
    }
    
    return config;
  }

  /**
   * Crée ou met à jour la configuration
   */
  async upsertConfig(
    tenantId: string,
    configData: Partial<ChatbotConfig>,
  ): Promise<ChatbotConfig> {
    const config = await this.chatbotConfigModel.findOneAndUpdate(
      { tenantId },
      {
        ...configData,
        tenantId,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true },
    );

    this.logger.log(`Configuration chatbot mise à jour pour tenant: ${tenantId}`);
    return config;
  }

  /**
   * Crée une configuration par défaut
   */
  async createDefaultConfig(tenantId: string): Promise<ChatbotConfig> {
    const defaultConfig = new this.chatbotConfigModel({
      tenantId,
      generalInfo: {
        storeName: 'Ma Boutique',
        storeDescription: 'Bienvenue dans notre boutique en ligne',
        welcomeMessage: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
        primaryColor: '#3b82f6',
        accentColor: '#8b5cf6',
      },
      businessHours: {
        monday: true,
        mondayOpen: '09:00',
        mondayClose: '18:00',
        tuesday: true,
        tuesdayOpen: '09:00',
        tuesdayClose: '18:00',
        wednesday: true,
        wednesdayOpen: '09:00',
        wednesdayClose: '18:00',
        thursday: true,
        thursdayOpen: '09:00',
        thursdayClose: '18:00',
        friday: true,
        fridayOpen: '09:00',
        fridayClose: '18:00',
        saturday: false,
        sunday: false,
      },
      paymentConfig: {
        acceptedMethods: ['cash'],
        cashOnDelivery: true,
        paymentInstructions: 'Paiement à la livraison disponible',
      },
      shippingConfig: {
        deliveryZones: ['Dakar'],
        deliveryCosts: new Map([['Dakar', 2000]]),
        estimatedDeliveryTime: '2-5 jours ouvrables',
        freeShippingThreshold: 0,
      },
      customResponses: {
        greetingMessage: 'Bonjour ! Bienvenue sur notre boutique. Comment puis-je vous aider ?',
        goodbyeMessage: 'Merci de votre visite ! À bientôt ! 👋',
        unavailableProductMessage: 'Désolé, ce produit n\'est pas disponible actuellement.',
        outOfStockMessage: 'Ce produit est en rupture de stock. Nous vous préviendrons lors du réapprovisionnement.',
        orderConfirmationMessage: 'Votre commande a été confirmée ! Vous recevrez un email de confirmation.',
        complaintHandlingMessage: 'Nous sommes désolés pour ce désagrément. Un de nos agents va vous contacter rapidement.',
      },
      returnPolicy: {
        returnsAccepted: true,
        returnPeriodDays: 14,
        returnConditions: 'Produit non ouvert, dans son emballage d\'origine',
        refundAvailable: true,
        exchangeAvailable: true,
      },
      autoReplyEnabled: true,
      language: 'fr',
      confidenceThreshold: 0.7,
      collectUserFeedback: true,
      enableRecommendations: true,
      maxRecommendations: 5,
      botPersonality: 'friendly',
      useEmojis: true,
      formalLanguage: false,
      isActive: true,
    });

    await defaultConfig.save();
    this.logger.log(`Configuration par défaut créée pour tenant: ${tenantId}`);
    
    return defaultConfig;
  }

  /**
   * Met à jour les infos générales
   */
  async updateGeneralInfo(tenantId: string, generalInfo: any): Promise<ChatbotConfig> {
    const config = await this.chatbotConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: { generalInfo, lastUpdated: new Date() } },
      { new: true },
    );

    if (!config) {
      throw new NotFoundException('Configuration non trouvée');
    }

    return config;
  }

  /**
   * Met à jour les horaires
   */
  async updateBusinessHours(tenantId: string, businessHours: any): Promise<ChatbotConfig> {
    return this.chatbotConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: { businessHours, lastUpdated: new Date() } },
      { new: true },
    );
  }

  /**
   * Ajoute une FAQ
   */
  async addFAQ(tenantId: string, faq: any): Promise<ChatbotConfig> {
    return this.chatbotConfigModel.findOneAndUpdate(
      { tenantId },
      { $push: { faqs: faq }, $set: { lastUpdated: new Date() } },
      { new: true },
    );
  }

  /**
   * Supprime une FAQ
   */
  async removeFAQ(tenantId: string, faqIndex: number): Promise<ChatbotConfig> {
    const config = await this.chatbotConfigModel.findOne({ tenantId });
    
    if (!config) {
      throw new NotFoundException('Configuration non trouvée');
    }

    config.faqs.splice(faqIndex, 1);
    config.lastUpdated = new Date();
    await config.save();

    return config;
  }

  /**
   * Vérifie si la boutique est ouverte
   */
  async isStoreOpen(tenantId: string): Promise<boolean> {
    const config = await this.getConfig(tenantId);
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    const hours = config.businessHours as any;
    const isOpenToday = hours[day];
    
    if (!isOpenToday) return false;

    const openTime = hours[`${day}Open`];
    const closeTime = hours[`${day}Close`];

    return currentTime >= openTime && currentTime <= closeTime;
  }

  /**
   * Récupère le message de bienvenue personnalisé
   */
  async getWelcomeMessage(tenantId: string): Promise<string> {
    const config = await this.getConfig(tenantId);
    const isOpen = await this.isStoreOpen(tenantId);

    let message = config.customResponses?.greetingMessage || 
                  config.generalInfo.welcomeMessage ||
                  'Bonjour ! Comment puis-je vous aider ?';

    if (!isOpen) {
      message += '\n\n⚠️ Nous sommes actuellement fermés. Nous vous répondrons dès notre ouverture.';
    }

    return message;
  }

  /**
   * Récupère les moyens de paiement acceptés
   */
  async getPaymentMethods(tenantId: string): Promise<string> {
    const config = await this.getConfig(tenantId);
    const methods = config.paymentConfig?.acceptedMethods || [];

    const methodNames = {
      'orange_money': '📱 Orange Money',
      'mtn_money': '📱 MTN Money',
      'wave': '📱 Wave',
      'moov_money': '📱 Moov Money',
      'card': '💳 Carte bancaire',
      'cash': '💵 Espèces à la livraison',
    };

    if (methods.length === 0) {
      return 'Contactez-nous pour les moyens de paiement disponibles.';
    }

    let message = 'Nous acceptons les moyens de paiement suivants :\n\n';
    methods.forEach(method => {
      message += `${methodNames[method] || method}\n`;
    });

    if (config.paymentConfig?.paymentInstructions) {
      message += `\n${config.paymentConfig.paymentInstructions}`;
    }

    return message;
  }

  /**
   * Récupère les infos de livraison
   */
  async getShippingInfo(tenantId: string, location?: string): Promise<string> {
    const config = await this.getConfig(tenantId);
    
    let message = '📦 Informations de livraison :\n\n';
    
    if (location && config.shippingConfig?.deliveryCosts) {
      const cost = config.shippingConfig.deliveryCosts.get(location);
      if (cost !== undefined) {
        message += `📍 ${location} : ${cost} FCFA\n`;
      }
    } else {
      message += `📍 Zones de livraison : ${config.shippingConfig?.deliveryZones?.join(', ') || 'Nous contacter'}\n`;
    }

    if (config.shippingConfig?.estimatedDeliveryTime) {
      message += `⏱️ Délai : ${config.shippingConfig.estimatedDeliveryTime}\n`;
    }

    if (config.shippingConfig?.freeShippingThreshold) {
      message += `\n🎁 Livraison gratuite à partir de ${config.shippingConfig.freeShippingThreshold} FCFA\n`;
    }

    if (config.shippingConfig?.shippingInstructions) {
      message += `\n${config.shippingConfig.shippingInstructions}`;
    }

    return message;
  }

  /**
   * Recherche dans les FAQs
   */
  async searchFAQ(tenantId: string, query: string): Promise<string | null> {
    const config = await this.getConfig(tenantId);
    const lowerQuery = query.toLowerCase();

    const faq = config.faqs?.find(item => {
      const questionMatch = item.question.toLowerCase().includes(lowerQuery);
      const keywordMatch = item.keywords?.some(kw => lowerQuery.includes(kw.toLowerCase()));
      return questionMatch || keywordMatch;
    });

    return faq ? faq.answer : null;
  }

  /**
   * Active/Désactive le chatbot
   */
  async toggleChatbot(tenantId: string, isActive: boolean): Promise<ChatbotConfig> {
    return this.chatbotConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: { isActive, lastUpdated: new Date() } },
      { new: true },
    );
  }
}
