import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VoiceCall, VoiceCallDocument, CallStatus, CallPurpose } from './schemas/voice-call.schema';

interface TwilioClient {
  calls: {
    create: (options: any) => Promise<any>;
  };
}

@Injectable()
export class VoiceCallsService {
  private readonly logger = new Logger(VoiceCallsService.name);
  private twilioClient: TwilioClient | null = null;
  private twilioPhone: string;

  constructor(
    @InjectModel(VoiceCall.name) public voiceCallModel: Model<VoiceCallDocument>,
    private configService: ConfigService,
  ) {
    // Initialiser Twilio si configuré
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.twilioPhone = this.configService.get('TWILIO_PHONE_NUMBER') || '';

    if (accountSid && authToken) {
      // TODO: Décommenter quand twilio sera installé
      // const twilio = require('twilio');
      // this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized (disabled for now)');
    } else {
      this.logger.warn('Twilio credentials not configured - voice calls will be simulated');
    }
  }

  /**
   * Créer un appel vocal pour panier abandonné
   */
  async createAbandonedCartCall(
    tenantId: string,
    data: {
      customerPhone: string;
      customerName?: string;
      customerEmail?: string;
      abandonedCartId: string;
      cartData: {
        products: Array<{ name: string; price: number; quantity: number }>;
        totalAmount: number;
      };
      discountCode?: string;
      discountAmount?: number;
      scheduledFor?: Date;
    },
  ): Promise<VoiceCall> {
    const call = new this.voiceCallModel({
      tenantId: new Types.ObjectId(tenantId),
      customerPhone: this.formatPhoneNumber(data.customerPhone),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      purpose: CallPurpose.ABANDONED_CART,
      status: data.scheduledFor ? CallStatus.PENDING : CallStatus.INITIATED,
      abandonedCartId: data.abandonedCartId,
      callData: {
        products: data.cartData.products,
        totalAmount: data.cartData.totalAmount,
        discountCode: data.discountCode,
        discountAmount: data.discountAmount,
      },
      scheduledFor: data.scheduledFor,
    });

    await call.save();

    // Si pas de planification, lancer l'appel immédiatement
    if (!data.scheduledFor) {
      await this.initiateCall(call._id.toString());
    }

    return call;
  }

  /**
   * Initier un appel vocal
   */
  async initiateCall(callId: string): Promise<VoiceCall> {
    const call = await this.voiceCallModel.findById(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    call.status = CallStatus.INITIATED;
    call.initiatedAt = new Date();

    if (this.twilioClient) {
      try {
        // Générer l'URL du script TwiML pour l'IA
        const twimlUrl = this.generateTwiMLUrl(call);

        const twilioCall = await this.twilioClient.calls.create({
          to: call.customerPhone,
          from: this.twilioPhone,
          url: twimlUrl,
          method: 'POST',
          statusCallback: `${this.configService.get('API_URL')}/voice-calls/webhook/status`,
          statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
          statusCallbackMethod: 'POST',
          record: true, // Enregistrer l'appel
          recordingStatusCallback: `${this.configService.get('API_URL')}/voice-calls/webhook/recording`,
          recordingStatusCallbackMethod: 'POST',
        });

        call.twilioCallSid = twilioCall.sid;
        this.logger.log(`Twilio call initiated: ${twilioCall.sid}`);
      } catch (error) {
        this.logger.error('Error initiating Twilio call:', error);
        call.status = CallStatus.FAILED;
        call.errorMessage = error.message;
      }
    } else {
      // Mode simulation
      this.logger.log(`[SIMULATION] Call to ${call.customerPhone} for ${call.purpose}`);
      call.status = CallStatus.COMPLETED;
      call.completedAt = new Date();
      call.duration = 45; // Simulation: 45 secondes
      call.aiResponse = {
        intent: 'interested',
        sentiment: 'positive',
        customerInterest: 'high',
        followUpNeeded: false,
      };
    }

    await call.save();
    return call;
  }

  /**
   * Générer le script TwiML pour l'appel IA
   */
  private generateTwiMLUrl(call: VoiceCallDocument): string {
    const baseUrl = this.configService.get('API_URL');
    return `${baseUrl}/voice-calls/twiml/${call._id.toString()}`;
  }

  /**
   * Générer le script TwiML dynamique basé sur le contexte
   */
  generateTwiML(call: VoiceCallDocument): string {
    let message = '';

    switch (call.purpose) {
      case CallPurpose.ABANDONED_CART:
        const customerName = call.customerName || 'cher client';
        const productCount = call.callData?.products?.length || 0;
        const total = call.callData?.totalAmount || 0;
        const discount = call.callData?.discountAmount || 0;

        message = `Bonjour ${customerName}. Nous avons remarqué que vous avez laissé ${productCount} article${productCount > 1 ? 's' : ''} dans votre panier pour un montant de ${total} euros. `;
        
        if (discount > 0) {
          message += `Nous vous offrons une réduction de ${discount} euros si vous finalisez votre commande aujourd'hui. `;
        }

        message += `Souhaitez-vous finaliser votre achat maintenant? Appuyez sur 1 pour oui, 2 pour parler à un conseiller, ou 3 pour être rappelé plus tard.`;
        break;

      case CallPurpose.ORDER_CONFIRMATION:
        message = `Bonjour. Votre commande numéro ${call.orderId} a bien été confirmée. Vous recevrez un email de confirmation sous peu. Merci pour votre confiance.`;
        break;

      default:
        message = 'Bonjour, merci de votre attention.';
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Lea" language="fr-FR">${message}</Say>
  <Gather numDigits="1" action="${this.configService.get('API_URL')}/voice-calls/webhook/gather/${call._id.toString()}" method="POST" timeout="10">
    <Say voice="Polly.Lea" language="fr-FR">Appuyez sur un chiffre maintenant.</Say>
  </Gather>
  <Say voice="Polly.Lea" language="fr-FR">Nous n'avons pas reçu de réponse. Au revoir.</Say>
</Response>`;
  }

  /**
   * Gérer la réponse du client (appui sur touche)
   */
  async handleGatherResponse(callId: string, digit: string): Promise<string> {
    const call = await this.voiceCallModel.findById(callId);
    if (!call) return this.generateErrorTwiML();

    let responseMessage = '';
    let followUpNeeded = false;
    let customerInterest: 'high' | 'medium' | 'low' | 'none' = 'none';

    switch (digit) {
      case '1': // Client intéressé
        responseMessage = 'Parfait! Nous vous envoyons un lien par SMS pour finaliser votre commande. Merci et à bientôt!';
        customerInterest = 'high';
        followUpNeeded = true;
        
        // TODO: Envoyer SMS avec lien de paiement
        break;

      case '2': // Parler à un conseiller
        responseMessage = 'Un instant, nous vous mettons en relation avec un conseiller.';
        customerInterest = 'medium';
        followUpNeeded = true;
        // TODO: Transférer vers un conseiller
        break;

      case '3': // Rappel plus tard
        responseMessage = 'Entendu, nous vous rappellerons demain. Bonne journée!';
        customerInterest = 'low';
        followUpNeeded = true;
        // TODO: Planifier un rappel
        break;

      default:
        responseMessage = 'Choix non reconnu. Au revoir.';
        customerInterest = 'none';
    }

    // Mettre à jour l'IA response
    call.aiResponse = {
      intent: digit === '1' ? 'purchase' : digit === '2' ? 'support' : digit === '3' ? 'callback' : 'unclear',
      sentiment: digit === '1' ? 'positive' : 'neutral',
      keyPhrases: [`Pressed ${digit}`],
      customerInterest,
      followUpNeeded,
    };

    await call.save();

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Lea" language="fr-FR">${responseMessage}</Say>
</Response>`;
  }

  /**
   * Gérer le webhook de statut Twilio
   */
  async handleStatusWebhook(callSid: string, status: string, duration?: number): Promise<void> {
    const call = await this.voiceCallModel.findOne({ twilioCallSid: callSid });
    if (!call) {
      this.logger.warn(`Call not found for SID: ${callSid}`);
      return;
    }

    switch (status) {
      case 'ringing':
        call.status = CallStatus.RINGING;
        break;
      case 'in-progress':
        call.status = CallStatus.IN_PROGRESS;
        break;
      case 'completed':
        call.status = CallStatus.COMPLETED;
        call.completedAt = new Date();
        if (duration) call.duration = parseInt(duration.toString());
        break;
      case 'busy':
        call.status = CallStatus.BUSY;
        break;
      case 'no-answer':
        call.status = CallStatus.NO_ANSWER;
        break;
      case 'failed':
        call.status = CallStatus.FAILED;
        break;
    }

    await call.save();
    this.logger.log(`Call ${callSid} status updated to ${status}`);
  }

  /**
   * Gérer le webhook d'enregistrement
   */
  async handleRecordingWebhook(callSid: string, recordingUrl: string, transcription?: string): Promise<void> {
    const call = await this.voiceCallModel.findOne({ twilioCallSid: callSid });
    if (!call) return;

    call.recordingUrl = recordingUrl;
    if (transcription) {
      call.transcription = transcription;
      // TODO: Analyser la transcription avec IA pour extraire intent et sentiment
    }

    await call.save();
  }

  /**
   * Récupérer tous les appels pour un tenant
   */
  async findAll(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: CallStatus;
      purpose?: CallPurpose;
    },
  ): Promise<{ calls: VoiceCall[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (options?.status) filter.status = options.status;
    if (options?.purpose) filter.purpose = options.purpose;

    const [calls, total] = await Promise.all([
      this.voiceCallModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.voiceCallModel.countDocuments(filter).exec(),
    ]);

    return { calls, total };
  }

  /**
   * Obtenir les statistiques des appels
   */
  async getStats(tenantId: string): Promise<{
    totalCalls: number;
    byStatus: Record<string, number>;
    byPurpose: Record<string, number>;
    averageDuration: number;
    conversionRate: number;
  }> {
    const calls = await this.voiceCallModel.find({ tenantId: new Types.ObjectId(tenantId) }).lean().exec();

    const byStatus: Record<string, number> = {};
    const byPurpose: Record<string, number> = {};
    let totalDuration = 0;
    let completedCalls = 0;
    let highInterest = 0;

    calls.forEach((call) => {
      byStatus[call.status] = (byStatus[call.status] || 0) + 1;
      byPurpose[call.purpose] = (byPurpose[call.purpose] || 0) + 1;
      
      if (call.duration) {
        totalDuration += call.duration;
        completedCalls++;
      }

      if (call.aiResponse?.customerInterest === 'high') {
        highInterest++;
      }
    });

    return {
      totalCalls: calls.length,
      byStatus,
      byPurpose,
      averageDuration: completedCalls > 0 ? Math.round(totalDuration / completedCalls) : 0,
      conversionRate: calls.length > 0 ? (highInterest / calls.length) * 100 : 0,
    };
  }

  /**
   * Réessayer un appel échoué
   */
  async retryCall(callId: string): Promise<VoiceCall> {
    const call = await this.voiceCallModel.findById(callId);
    if (!call) throw new Error('Call not found');

    call.retryCount += 1;
    call.lastRetryAt = new Date();
    call.status = CallStatus.PENDING;
    call.errorMessage = undefined;

    await call.save();
    return this.initiateCall(callId);
  }

  /**
   * Formater le numéro de téléphone au format E.164
   */
  private formatPhoneNumber(phone: string): string {
    // Retirer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');
    
    // Ajouter le préfixe international si absent
    if (!cleaned.startsWith('+')) {
      // Par défaut France (+33)
      if (cleaned.startsWith('0')) {
        cleaned = '+33' + cleaned.substring(1);
      } else {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  }

  private generateErrorTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Lea" language="fr-FR">Désolé, une erreur s'est produite. Veuillez réessayer plus tard.</Say>
</Response>`;
  }
}
