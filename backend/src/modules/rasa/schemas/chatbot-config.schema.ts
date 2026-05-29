import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatbotConfigDocument = ChatbotConfig & Document;

// Informations générales de la boutique
class GeneralInfo {
  @Prop({ required: true })
  storeName: string;

  @Prop()
  storeDescription: string;

  @Prop()
  welcomeMessage: string;

  @Prop()
  logo: string;

  @Prop()
  primaryColor: string;

  @Prop()
  accentColor: string;
}

// Horaires d'ouverture
class BusinessHours {
  @Prop({ default: true })
  monday: boolean;

  @Prop({ default: '09:00' })
  mondayOpen: string;

  @Prop({ default: '18:00' })
  mondayClose: string;

  @Prop({ default: true })
  tuesday: boolean;

  @Prop({ default: '09:00' })
  tuesdayOpen: string;

  @Prop({ default: '18:00' })
  tuesdayClose: string;

  @Prop({ default: true })
  wednesday: boolean;

  @Prop({ default: '09:00' })
  wednesdayOpen: string;

  @Prop({ default: '18:00' })
  wednesdayClose: string;

  @Prop({ default: true })
  thursday: boolean;

  @Prop({ default: '09:00' })
  thursdayOpen: string;

  @Prop({ default: '18:00' })
  thursdayClose: string;

  @Prop({ default: true })
  friday: boolean;

  @Prop({ default: '09:00' })
  fridayOpen: string;

  @Prop({ default: '18:00' })
  fridayClose: string;

  @Prop({ default: false })
  saturday: boolean;

  @Prop({ default: '09:00' })
  saturdayOpen: string;

  @Prop({ default: '18:00' })
  saturdayClose: string;

  @Prop({ default: false })
  sunday: boolean;

  @Prop({ default: '09:00' })
  sundayOpen: string;

  @Prop({ default: '18:00' })
  sundayClose: string;
}

// Configuration des paiements
class PaymentConfig {
  @Prop({ type: [String], default: [] })
  acceptedMethods: string[]; // orange_money, mtn_money, wave, card, cash

  @Prop()
  orangeMoneyNumber: string;

  @Prop()
  mtnMoneyNumber: string;

  @Prop()
  waveNumber: string;

  @Prop({ default: true })
  cashOnDelivery: boolean;

  @Prop()
  paymentInstructions: string;
}

// Configuration de livraison
class ShippingConfig {
  @Prop({ type: [String], default: [] })
  deliveryZones: string[]; // Dakar, Thies, Saint-Louis, etc.

  @Prop({ type: Map, of: Number })
  deliveryCosts: Map<string, number>; // { "Dakar": 2000, "Thies": 3000 }

  @Prop()
  estimatedDeliveryTime: string; // "2-3 jours"

  @Prop({ default: false })
  freeShippingThreshold: number; // Livraison gratuite au-dessus de X FCFA

  @Prop()
  shippingInstructions: string;
}

// FAQ personnalisées
class FAQItem {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];
}

// Produits vedettes
class FeaturedProduct {
  @Prop({ required: true })
  productId: string;

  @Prop()
  customDescription: string;

  @Prop({ default: false })
  inPromotion: boolean;

  @Prop()
  promotionMessage: string;
}

// Réponses personnalisées
class CustomResponses {
  @Prop()
  greetingMessage: string;

  @Prop()
  goodbyeMessage: string;

  @Prop()
  unavailableProductMessage: string;

  @Prop()
  outOfStockMessage: string;

  @Prop()
  orderConfirmationMessage: string;

  @Prop()
  complaintHandlingMessage: string;
}

// Politique de retour
class ReturnPolicy {
  @Prop({ default: true })
  returnsAccepted: boolean;

  @Prop({ default: 14 })
  returnPeriodDays: number;

  @Prop()
  returnConditions: string;

  @Prop()
  returnInstructions: string;

  @Prop({ default: true })
  refundAvailable: boolean;

  @Prop({ default: true })
  exchangeAvailable: boolean;
}

// Contact de la boutique
class ContactInfo {
  @Prop()
  phone: string;

  @Prop()
  whatsapp: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop()
  facebook: string;

  @Prop()
  instagram: string;

  @Prop()
  website: string;
}

@Schema({ timestamps: true })
export class ChatbotConfig {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ type: GeneralInfo, required: true })
  generalInfo: GeneralInfo;

  @Prop({ type: BusinessHours })
  businessHours: BusinessHours;

  @Prop({ type: PaymentConfig })
  paymentConfig: PaymentConfig;

  @Prop({ type: ShippingConfig })
  shippingConfig: ShippingConfig;

  @Prop({ type: [FAQItem], default: [] })
  faqs: FAQItem[];

  @Prop({ type: [FeaturedProduct], default: [] })
  featuredProducts: FeaturedProduct[];

  @Prop({ type: CustomResponses })
  customResponses: CustomResponses;

  @Prop({ type: ReturnPolicy })
  returnPolicy: ReturnPolicy;

  @Prop({ type: ContactInfo })
  contactInfo: ContactInfo;

  // Configuration avancée
  @Prop({ default: true })
  autoReplyEnabled: boolean;

  @Prop({ default: 'fr' })
  language: string;

  @Prop({ default: 0.7 })
  confidenceThreshold: number;

  @Prop({ default: true })
  collectUserFeedback: boolean;

  @Prop({ default: true })
  enableRecommendations: boolean;

  @Prop({ default: 5 })
  maxRecommendations: number;

  // Personnalisation du ton
  @Prop({ default: 'friendly' })
  botPersonality: string; // friendly, professional, casual

  @Prop({ default: true })
  useEmojis: boolean;

  @Prop({ default: false })
  formalLanguage: boolean;

  // Métadonnées
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop()
  trainedModelVersion: string;
}

export const ChatbotConfigSchema = SchemaFactory.createForClass(ChatbotConfig);

// Index pour recherche rapide (unique car 1 config par tenant)
ChatbotConfigSchema.index({ tenantId: 1 }, { unique: true });
