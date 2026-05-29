import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument, Message } from './schemas/conversation.schema';
import { RasaClientService } from './rasa-client.service';
import { ChatbotConfigService } from './chatbot-config.service';
import { RasaSendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto, GetConversationsDto } from './dto/conversation.dto';

@Injectable()
export class RasaService {
  private readonly logger = new Logger(RasaService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private rasaClient: RasaClientService,
    private chatbotConfigService: ChatbotConfigService,
  ) {}

  /**
   * Envoie un message et récupère la réponse du bot
   */
  async sendMessage(
    userId: string,
    tenantId: string,
    messageDto: RasaSendMessageDto,
  ): Promise<any> {
    try {
      // Récupère ou crée une conversation
      let conversation = messageDto.conversationId
        ? await this.conversationModel.findById(messageDto.conversationId)
        : await this.getOrCreateActiveConversation(userId, tenantId, messageDto.channel);

      if (!conversation) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Ajoute le message de l'utilisateur
      const userMessage: Message = {
        id: this.generateMessageId(),
        sender: 'user',
        text: messageDto.message,
        timestamp: new Date(),
        metadata: messageDto.metadata,
      };

      conversation.messages.push(userMessage);
      conversation.messageCount += 1;

      // Envoie le message à Rasa
      const rasaResponses = await this.rasaClient.sendMessage({
        sender: conversation.id,
        message: messageDto.message,
        metadata: {
          userId,
          tenantId,
          channel: messageDto.channel,
        },
      });

      // Ajoute les réponses du bot
      const botMessages: Message[] = [];
      let totalConfidence = 0;

      for (const rasaResponse of rasaResponses) {
        const confidence = rasaResponse.custom?.confidence || 0.9;
        totalConfidence += confidence;

        const botMessage: Message = {
          id: this.generateMessageId(),
          sender: 'bot',
          text: rasaResponse.text || '',
          timestamp: new Date(),
          intent: rasaResponse.custom?.intent,
          confidence,
          buttons: rasaResponse.buttons,
          quickReplies: rasaResponse.quick_replies,
        };

        botMessages.push(botMessage);
        conversation.messages.push(botMessage);
        conversation.messageCount += 1;
      }

      // Met à jour la confiance moyenne
      if (botMessages.length > 0) {
        conversation.averageConfidence = totalConfidence / botMessages.length;
        conversation.currentIntent = botMessages[0].intent;
      }

      // Sauvegarde la conversation
      await conversation.save();

      this.logger.debug(`Message traité pour conversation ${conversation.id}`);

      return {
        conversationId: conversation.id,
        userMessage,
        botMessages,
        confidence: conversation.averageConfidence,
      };
    } catch (error) {
      this.logger.error(`Erreur envoi message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère ou crée une conversation active
   */
  async getOrCreateActiveConversation(
    userId: string,
    tenantId: string,
    channel: string = 'web',
  ): Promise<ConversationDocument> {
    // Cherche une conversation active
    let conversation = await this.conversationModel.findOne({
      userId,
      tenantId,
      status: 'active',
      channel,
    }).sort({ startedAt: -1 });

    // Crée une nouvelle conversation si aucune active
    if (!conversation) {
      conversation = await this.conversationModel.create({
        userId,
        tenantId,
        channel,
        status: 'active',
        startedAt: new Date(),
        messages: [],
        messageCount: 0,
        metadata: {},
        context: {},
      });

      this.logger.log(`Nouvelle conversation créée: ${conversation.id}`);
    }

    return conversation;
  }

  /**
   * Récupère une conversation par ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    return conversation;
  }

  /**
   * Récupère la liste des conversations avec pagination
   */
  async getConversations(
    tenantId: string,
    query: GetConversationsDto,
  ): Promise<{ conversations: Conversation[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { tenantId };
    
    if (query.status) filter.status = query.status;
    if (query.channel) filter.channel = query.channel;
    if (query.userId) filter.userId = query.userId;

    const [conversations, total] = await Promise.all([
      this.conversationModel
        .find(filter)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.conversationModel.countDocuments(filter),
    ]);

    return {
      conversations,
      total,
      page,
      limit,
    };
  }

  /**
   * Met à jour une conversation
   */
  async updateConversation(
    conversationId: string,
    updateDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    if (updateDto.status) {
      conversation.status = updateDto.status;
      
      if (updateDto.status === 'closed' || updateDto.status === 'resolved') {
        conversation.endedAt = new Date();
        conversation.duration = Math.floor(
          (conversation.endedAt.getTime() - conversation.startedAt.getTime()) / 1000,
        );
      }
    }

    if (updateDto.satisfaction) {
      conversation.satisfaction = updateDto.satisfaction;
      conversation.satisfactionFeedback = updateDto.satisfactionFeedback;
    }

    if (updateDto.tags) {
      conversation.tags = updateDto.tags;
    }

    await conversation.save();

    this.logger.log(`Conversation ${conversationId} mise à jour`);
    return conversation;
  }

  /**
   * Clôture une conversation
   */
  async closeConversation(conversationId: string): Promise<Conversation> {
    return this.updateConversation(conversationId, { status: 'closed' });
  }

  /**
   * Récupère les analytics de conversation
   */
  async getAnalytics(tenantId: string): Promise<any> {
    const [
      totalConversations,
      activeConversations,
      resolvedConversations,
      averageConfidence,
      averageSatisfaction,
    ] = await Promise.all([
      this.conversationModel.countDocuments({ tenantId }),
      this.conversationModel.countDocuments({ tenantId, status: 'active' }),
      this.conversationModel.countDocuments({ tenantId, status: 'resolved' }),
      this.conversationModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: null, avgConfidence: { $avg: '$averageConfidence' } } },
      ]),
      this.conversationModel.aggregate([
        { $match: { tenantId, satisfaction: { $exists: true } } },
        { $group: { _id: null, avgSatisfaction: { $avg: '$satisfaction' } } },
      ]),
    ]);

    const resolutionRate = totalConversations > 0
      ? (resolvedConversations / totalConversations) * 100
      : 0;

    return {
      totalConversations,
      activeConversations,
      resolvedConversations,
      resolutionRate: Math.round(resolutionRate * 10) / 10,
      averageConfidence: averageConfidence[0]?.avgConfidence || 0,
      averageSatisfaction: averageSatisfaction[0]?.avgSatisfaction || 0,
    };
  }

  /**
   * Récupère les top intents
   */
  async getTopIntents(tenantId: string, limit: number = 10): Promise<any[]> {
    const result = await this.conversationModel.aggregate([
      { $match: { tenantId, currentIntent: { $exists: true } } },
      { $group: { _id: '$currentIntent', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((item) => ({
      intent: item._id,
      count: item.count,
    }));
  }

  /**
   * Health check du service Rasa
   */
  async healthCheck(): Promise<{ status: string; rasaConnected: boolean }> {
    const rasaConnected = await this.rasaClient.healthCheck();
    
    return {
      status: rasaConnected ? 'healthy' : 'degraded',
      rasaConnected,
    };
  }

  /**
   * Génère un ID unique pour les messages
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
