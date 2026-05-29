import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OnboardingSurveyDocument = OnboardingSurvey & Document;

@Schema({ timestamps: true })
export class OnboardingSurvey {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: MongooseSchema.Types.ObjectId;

  // Question 0: Quel type d'activité avez-vous ?
  @Prop({ 
    type: String, 
    enum: ['ecommerce', 'restaurant', 'cafe', 'service', 'marketplace', 'blog', 'portfolio', 'autre'],
    required: true 
  })
  businessType: string;

  @Prop({ type: String }) // Si "autre" est sélectionné
  businessTypeOther?: string;

  // Question 1: Comment avez-vous trouvé notre solution ?
  @Prop({ 
    type: String, 
    enum: ['internet', 'social_media', 'bouche_a_oreille', 'publicite', 'moteur_recherche', 'autre'],
    required: true 
  })
  discoverySource: string;

  @Prop({ type: String }) // Si "autre" est sélectionné
  discoverySourceOther?: string;

  // Question 2: Depuis combien d'années êtes-vous dans l'e-commerce ?
  @Prop({ 
    type: String, 
    enum: ['debutant', '0-1_an', '1-3_ans', '3-5_ans', '5_plus_ans'],
    required: true 
  })
  ecommerceExperience: string;

  // Question 3: Avez-vous suivi des formations ou études ?
  @Prop({ type: Boolean, required: true })
  hasTraining: boolean;

  @Prop({ type: [String] }) // Types de formations
  trainingTypes?: string[];

  @Prop({ type: String }) // Détails sur les formations
  trainingDetails?: string;

  // Question 4: Avez-vous déjà de l'expérience ?
  @Prop({ type: Boolean, required: true })
  hasPreviousExperience: boolean;

  // Question 5: Quels outils avez-vous déjà utilisés ?
  @Prop({ type: [String] }) // Sites e-commerce utilisés
  usedEcommercePlatforms?: string[]; // Ex: Shopify, WooCommerce, PrestaShop, Magento

  @Prop({ type: [String] }) // Réseaux sociaux utilisés
  usedSocialMediaPlatforms?: string[]; // Ex: Facebook, Instagram, TikTok, LinkedIn

  @Prop({ type: [String] }) // Autres outils
  usedMarketingTools?: string[]; // Ex: Google Ads, Facebook Ads, Email Marketing

  // Question 6: Quel est votre objectif principal ?
  @Prop({ 
    type: String, 
    enum: ['lancer_boutique', 'augmenter_ventes', 'automatiser_processus', 'ameliorer_marketing', 'gerer_inventaire', 'autre'],
    required: true 
  })
  mainGoal: string;

  @Prop({ type: String })
  mainGoalOther?: string;

  // Question 7: Quel est votre budget marketing mensuel ?
  @Prop({ 
    type: String, 
    enum: ['moins_100', '100-500', '500-1000', '1000-5000', '5000_plus', 'pas_encore_defini']
  })
  marketingBudget?: string;

  // Question 8: Combien de produits prévoyez-vous de vendre ?
  @Prop({ 
    type: String, 
    enum: ['1-10', '10-50', '50-100', '100-500', '500_plus']
  })
  expectedProductCount?: string;

  // Question 9: Quel type de produits vendez-vous ?
  @Prop({ type: [String] }) // Ex: vêtements, électronique, cosmétiques, etc.
  productCategories?: string[];

  @Prop({ type: String })
  productCategoriesOther?: string;

  @Prop({ type: [String] })
  targetAges?: string[];

  @Prop({ type: [String] })
  targetGenders?: string[];

  @Prop({ type: String, enum: ['weekly','monthly','quarterly','annually'] })
  buyingFrequency?: string;

  @Prop({ type: String })
  avgOrderValue?: string;

  @Prop({ type: [String] })
  peakMonths?: string[];

  @Prop({ type: [String] })
  topAcquisitionChannels?: string[];

  @Prop({ type: [String] })
  preferredPaymentMethods?: string[];

  @Prop({ type: String })
  returnsRate?: string;

  @Prop({ type: String, enum: ['mobile','desktop','both'], default: 'both' })
  devicePreference?: string;

  @Prop({ type: String })
  brandName?: string;

  @Prop({ type: String })
  contactEmail?: string;

  @Prop({ type: String })
  contactPhone?: string;

  @Prop({ type: String })
  slogan?: string;

  @Prop({ type: String })
  logoUrl?: string;

  // Question 10: Avez-vous déjà un site web ?
  @Prop({ type: Boolean })
  hasExistingWebsite?: boolean;

  @Prop({ type: String })
  existingWebsiteUrl?: string;

  @Prop({ 
    type: String,
    enum: [
      'shopify', 'woocommerce', 'prestashop', 'magento', 
      'odoo', 'bigcommerce', 'wix', 'squarespace', 
      'wordpress', 'drupal', 'joomla',
      'custom', 'autre', 'none'
    ]
  })
  existingWebsitePlatform?: string; // Plateforme du site existant

  @Prop({ type: Boolean, default: false })
  wantsToConnectExistingSite?: boolean; // Veut connecter son site existant au dashboard

  @Prop({ type: Boolean, default: false })
  wantsToCreateNewSite?: boolean; // Veut créer un nouveau site

  // Question 11: Taille de l'équipe
  @Prop({ 
    type: String, 
    enum: ['solo', '2-5', '6-10', '11-50', '50_plus']
  })
  teamSize?: string;

  // Notes supplémentaires
  @Prop({ type: String })
  additionalNotes?: string;

  // Nouveau: difficultés et préférences site
  @Prop({ type: String })
  ecommerceDifficulties?: string;

  @Prop({ type: String })
  otherDomainDifficulties?: string;

  @Prop({ type: String, enum: ['simple','catalog','marketplace','blog','custom'], default: 'catalog' })
  siteArchitecturePreference?: string;

  @Prop({ type: [String] })
  advancedFeatures?: string[];

  @Prop({ type: Boolean, default: false })
  buyDomain?: boolean;

  @Prop({ type: String })
  desiredDomainName?: string;

  @Prop({ type: String })
  domainProvider?: string;

  // Statut du questionnaire
  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const OnboardingSurveySchema = SchemaFactory.createForClass(OnboardingSurvey);

// Index pour recherche rapide
OnboardingSurveySchema.index({ userId: 1 });
OnboardingSurveySchema.index({ tenantId: 1 });
