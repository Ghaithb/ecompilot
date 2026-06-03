import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { WhatsAppMessage, WhatsAppMessageDocument } from './schemas/whatsapp-message.schema';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import {
  WhatsAppSendMessageDto,
  SendTemplateDto,
  SendMediaDto,
  OrderNotificationDto,
  LowStockAlertDto,
} from './dto/send-message.dto';

import { IWhatsAppProvider } from './interfaces/whatsapp-provider.interface';
import { WahaProvider } from './providers/waha.provider';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @InjectModel(WhatsAppMessage.name)
    private messageModel: Model<WhatsAppMessageDocument>,
    private metaWhatsAppProvider: MetaWhatsAppProvider,
    private wahaProvider: WahaProvider,
    private readonly configService: ConfigService,
  ) {}

  private getProvider(): IWhatsAppProvider {
    const providerType = this.configService.get<string>('messaging.whatsapp.provider') || 'meta';
    if (providerType === 'waha') {
      return this.wahaProvider;
    }
    return this.metaWhatsAppProvider;
  }

  /**
   * Envoyer un message texte simple
   */
  async sendTextMessage(tenantId: string, dto: WhatsAppSendMessageDto) {
    try {
      // Envoyer via provider
      const result = await this.getProvider().sendTextMessage(dto.to, dto.message);

      // Sauvegarder en base
      const message = new this.messageModel({
        tenantId: new Types.ObjectId(tenantId),
        to: dto.to,
        from: this.configService.get<string>('messaging.whatsapp.businessNumber')
          || process.env.WHATSAPP_BUSINESS_NUMBER
          || '0000000000',
        message: dto.message,
        type: 'text',
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        direction: 'outbound',
        error: result.error,
        sentAt: new Date(),
      });

      await message.save();

      return {
        success: result.success,
        messageId: result.messageId || message._id,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(`Erreur sendTextMessage:`, error);
      throw error;
    }
  }

  /**
   * Envoyer un message template
   */
  async sendTemplateMessage(tenantId: string, dto: SendTemplateDto) {
    try {
      const result = await this.getProvider().sendTemplateMessage(
        dto.to,
        dto.templateName,
        dto.params || {},
      );

      const message = new this.messageModel({
        tenantId: new Types.ObjectId(tenantId),
        to: dto.to,
        from: this.configService.get<string>('messaging.whatsapp.businessNumber')
          || process.env.WHATSAPP_BUSINESS_NUMBER
          || '0000000000',
        message: `Template: ${dto.templateName}`,
        type: 'template',
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        templateName: dto.templateName,
        templateParams: dto.params,
        direction: 'outbound',
        error: result.error,
        sentAt: new Date(),
      });

      await message.save();

      return {
        success: result.success,
        messageId: result.messageId || message._id,
        templateName: dto.templateName,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(`Erreur sendTemplateMessage:`, error);
      throw error;
    }
  }

  /**
   * Notification nouvelle commande
   */
  async sendOrderNotification(tenantId: string, dto: OrderNotificationDto) {
    return this.sendTemplateMessage(tenantId, {
      to: dto.to,
      templateName: 'order_confirmation',
      params: {
        orderNumber: dto.orderNumber,
        amount: dto.amount,
        customerName: dto.customerName,
        link: dto.link || '',
      },
    });
  }

  /**
   * Notification mise à jour statut livraison
   */
  async sendShippingUpdate(tenantId: string, dto: { to: string; orderNumber: string; status: string; trackingNumber?: string }) {
    return this.sendTemplateMessage(tenantId, {
      to: dto.to,
      templateName: 'shipping_update',
      params: {
        orderNumber: dto.orderNumber,
        status: dto.status,
        trackingNumber: dto.trackingNumber || '',
      },
    });
  }

  /**
   * Message personnalisé
   */
  async sendCustomMessage(tenantId: string, to: string, message: string) {
    return this.sendTextMessage(tenantId, { to, message });
  }

  /**
   * Alerte stock faible
   */
  async sendLowStockAlert(tenantId: string, dto: LowStockAlertDto) {
    return this.sendTemplateMessage(tenantId, {
      to: dto.to,
      templateName: 'low_stock_alert',
      params: {
        productName: dto.productName,
        stock: dto.stock.toString(),
        threshold: dto.threshold?.toString() || '5',
      },
    });
  }

  /**
   * Message de bienvenue
   */
  async sendWelcomeMessage(tenantId: string, to: string, customerName: string, storeName: string) {
    return this.sendTemplateMessage(tenantId, {
      to,
      templateName: 'welcome_message',
      params: {
        customerName,
        storeName,
      },
    });
  }

  /**
   * Confirmation paiement
   */
  async sendPaymentConfirmation(
    tenantId: string,
    to: string,
    amount: string,
    reference: string,
    method?: string,
  ) {
    return this.sendTemplateMessage(tenantId, {
      to,
      templateName: 'payment_confirmed',
      params: {
        amount,
        reference,
        method: method || 'Mobile Money',
      },
    });
  }

  /**
   * Récupérer historique messages d'un tenant
   */
  async getMessages(tenantId: string, limit: number = 50, skip: number = 0) {
    return this.messageModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Récupérer messages vers un numéro spécifique
   */
  async getMessagesByPhone(tenantId: string, phoneNumber: string, limit: number = 50) {
    return this.messageModel
      .find({ tenantId, $or: [{ to: phoneNumber }, { from: phoneNumber }] })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Obtenir statistiques messages
   */
  async getStatistics(tenantId: string, startDate?: Date, endDate?: Date) {
    const query: any = { tenantId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const [total, sent, delivered, failed, byType] = await Promise.all([
      this.messageModel.countDocuments(query),
      this.messageModel.countDocuments({ ...query, status: 'sent' }),
      this.messageModel.countDocuments({ ...query, status: 'delivered' }),
      this.messageModel.countDocuments({ ...query, status: 'failed' }),
      this.messageModel.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      sent,
      delivered,
      failed,
      successRate: total > 0 ? ((sent + delivered) / total) * 100 : 0,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  /**
   * Vérifier configuration WhatsApp
   */
  async checkConfiguration() {
    const provider = this.getProvider();
    return {
      configured: provider.isConfigured(),
      provider:
        this.configService.get<string>('messaging.whatsapp.provider') || 'Meta WhatsApp Cloud API',
      businessNumber: provider.getBusinessNumber() || 'Not configured',
    };
  }

  getWhatsAppChatUrl(message?: string): string {
    return this.getProvider().getWhatsAppChatUrl(message);
  }

  /**
   * Vérification webhook Meta (GET hub.challenge)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken =
      this.configService.get<string>('messaging.whatsapp.verifyToken') || 'ecompilot_verify';

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook Meta WhatsApp vérifié');
      return challenge;
    }

    throw new ForbiddenException('Token de vérification webhook invalide');
  }

  /**
   * Webhook - Traiter messages entrants Meta WhatsApp Cloud API
   */
  async handleIncomingMessage(payload: Record<string, unknown>) {
    try {
      if (payload.object !== 'whatsapp_business_account') {
        return { success: true, ignored: true };
      }

      const entries = (payload.entry as Array<Record<string, unknown>>) || [];
      let processed = 0;

      for (const entry of entries) {
        const changes = (entry.changes as Array<Record<string, unknown>>) || [];
        for (const change of changes) {
          const value = change.value as Record<string, unknown> | undefined;
          const messages = (value?.messages as Array<Record<string, unknown>>) || [];

          for (const msg of messages) {
            const from = msg.from as string;
            const textBody = (msg.text as { body?: string })?.body || '';
            const messageId = msg.id as string;
            const timestamp = msg.timestamp as string;

            this.logger.log(`WhatsApp entrant de ${from}: ${textBody.slice(0, 120)}`);
            processed += 1;
          }
        }
      }

      return { success: true, processed };
    } catch (error) {
      this.logger.error('Erreur handleIncomingMessage:', error);
      return { success: true };
    }
  }
}
