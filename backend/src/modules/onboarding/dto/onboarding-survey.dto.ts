import { IsString, IsBoolean, IsArray, IsOptional, IsEnum, IsUrl, ValidateIf, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteOnboardingSurveyDto {
  @ApiProperty({
    description: 'Type d\'activité',
    enum: ['ecommerce', 'restaurant', 'cafe', 'service', 'marketplace', 'blog', 'portfolio', 'autre'],
    example: 'ecommerce'
  })
  @IsEnum(['ecommerce', 'restaurant', 'cafe', 'service', 'marketplace', 'blog', 'portfolio', 'autre'])
  businessType: string;

  @ApiPropertyOptional({
    description: 'Précisez si "autre" est sélectionné',
    example: 'Salon de coiffure'
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.businessType === 'autre')
  businessTypeOther?: string;

  @ApiProperty({
    description: 'Comment avez-vous trouvé notre solution ?',
    enum: ['internet', 'social_media', 'bouche_a_oreille', 'publicite', 'moteur_recherche', 'autre'],
    example: 'social_media'
  })
  @IsEnum(['internet', 'social_media', 'bouche_a_oreille', 'publicite', 'moteur_recherche', 'autre'])
  discoverySource: string;

  @ApiPropertyOptional({
    description: 'Précisez si "autre" est sélectionné',
    example: 'Recommandation d\'un ami'
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.discoverySource === 'autre')
  discoverySourceOther?: string;

  @ApiProperty({
    description: 'Depuis combien d\'années êtes-vous dans l\'e-commerce ?',
    enum: ['debutant', '0-1_an', '1-3_ans', '3-5_ans', '5_plus_ans'],
    example: '1-3_ans'
  })
  @IsEnum(['debutant', '0-1_an', '1-3_ans', '3-5_ans', '5_plus_ans'])
  ecommerceExperience: string;

  @ApiProperty({
    description: 'Avez-vous suivi des formations ou études en e-commerce/marketing ?',
    example: true
  })
  @IsBoolean()
  hasTraining: boolean;

  @ApiPropertyOptional({
    description: 'Types de formations suivies',
    type: [String],
    example: ['Formation e-commerce', 'Marketing digital', 'Dropshipping']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trainingTypes?: string[];

  @ApiPropertyOptional({
    description: 'Détails sur les formations',
    example: 'Formation certifiée Google Digital Marketing'
  })
  @IsOptional()
  @IsString()
  trainingDetails?: string;

  @ApiProperty({
    description: 'Avez-vous déjà de l\'expérience en e-commerce ?',
    example: true
  })
  @IsBoolean()
  hasPreviousExperience: boolean;

  @ApiPropertyOptional({
    description: 'Plateformes e-commerce que vous avez utilisées',
    type: [String],
    example: ['Shopify', 'WooCommerce', 'PrestaShop']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedEcommercePlatforms?: string[];

  @ApiPropertyOptional({
    description: 'Réseaux sociaux utilisés pour votre business',
    type: [String],
    example: ['Facebook', 'Instagram', 'TikTok']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedSocialMediaPlatforms?: string[];

  @ApiPropertyOptional({
    description: 'Outils marketing utilisés',
    type: [String],
    example: ['Google Ads', 'Facebook Ads', 'Mailchimp']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedMarketingTools?: string[];

  @ApiProperty({
    description: 'Quel est votre objectif principal ?',
    enum: ['lancer_boutique', 'augmenter_ventes', 'automatiser_processus', 'ameliorer_marketing', 'gerer_inventaire', 'autre'],
    example: 'lancer_boutique'
  })
  @IsEnum(['lancer_boutique', 'augmenter_ventes', 'automatiser_processus', 'ameliorer_marketing', 'gerer_inventaire', 'autre'])
  mainGoal: string;

  @ApiPropertyOptional({
    description: 'Précisez votre objectif si "autre"',
    example: 'Développer une marketplace'
  })
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.mainGoal === 'autre')
  mainGoalOther?: string;

  @ApiPropertyOptional({
    description: 'Budget marketing mensuel',
    enum: ['moins_100', '100-500', '500-1000', '1000-5000', '5000_plus', 'pas_encore_defini'],
    example: '500-1000'
  })
  @IsOptional()
  @IsEnum(['moins_100', '100-500', '500-1000', '1000-5000', '5000_plus', 'pas_encore_defini'])
  marketingBudget?: string;

  @ApiPropertyOptional({
    description: 'Nombre de produits prévus',
    enum: ['1-10', '10-50', '50-100', '100-500', '500_plus'],
    example: '50-100'
  })
  @IsOptional()
  @IsEnum(['1-10', '10-50', '50-100', '100-500', '500_plus'])
  expectedProductCount?: string;

  @ApiPropertyOptional({
    description: 'Catégories de produits',
    type: [String],
    example: ['Vêtements', 'Accessoires', 'Cosmétiques']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productCategories?: string[];

  @ApiPropertyOptional({
    description: 'Autres catégories de produits',
    example: 'Produits artisanaux'
  })
  @IsOptional()
  @IsString()
  productCategoriesOther?: string;

  @ApiPropertyOptional({
    description: 'Tranches d\'âge cibles',
    type: [String],
    example: ['25-34', '35-44']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAges?: string[];

  @ApiPropertyOptional({
    description: 'Genres cibles',
    type: [String],
    example: ['All', 'Female']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetGenders?: string[];

  @ApiPropertyOptional({
    description: 'Fréquence d\'achat',
    enum: ['weekly','monthly','quarterly','annually'],
    example: 'monthly'
  })
  @IsOptional()
  @IsEnum(['weekly','monthly','quarterly','annually'])
  buyingFrequency?: string;

  @ApiPropertyOptional({
    description: 'Panier moyen (AOV) en format texte',
    example: '49.99'
  })
  @IsOptional()
  @IsString()
  avgOrderValue?: string;

  @ApiPropertyOptional({
    description: 'Mois de pointe (saisonnalité)',
    type: [String],
    example: ['Nov','Dec']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  peakMonths?: string[];

  @ApiPropertyOptional({
    description: 'Canaux d\'acquisition principaux',
    type: [String],
    example: ['Organic Search','Social Media']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topAcquisitionChannels?: string[];

  @ApiPropertyOptional({
    description: 'Méthodes de paiement préférées',
    type: [String],
    example: ['Card','PayPal']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredPaymentMethods?: string[];

  @ApiPropertyOptional({
    description: 'Taux de retours estimé (%)',
    example: '5'
  })
  @IsOptional()
  @IsString()
  returnsRate?: string;

  @ApiPropertyOptional({
    description: 'Préférence d\'appareil',
    enum: ['mobile','desktop','both'],
    example: 'both'
  })
  @IsOptional()
  @IsEnum(['mobile','desktop','both'])
  devicePreference?: string;

  @ApiPropertyOptional({ description: 'Nom de la marque' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ description: 'Email de contact' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Téléphone de contact' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Slogan de la marque' })
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional({ description: 'URL du logo uploadé' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Avez-vous déjà un site web ?',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  hasExistingWebsite?: boolean;

  @ApiPropertyOptional({
    description: 'URL de votre site web existant',
    example: 'https://monsite.com'
  })
  @IsOptional()
  @IsUrl()
  @ValidateIf(o => o.hasExistingWebsite === true)
  existingWebsiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Plateforme du site existant',
    enum: [
      'shopify', 'woocommerce', 'prestashop', 'magento', 
      'odoo', 'bigcommerce', 'wix', 'squarespace', 
      'wordpress', 'drupal', 'joomla',
      'custom', 'autre', 'none'
    ],
    example: 'shopify'
  })
  @IsOptional()
  @IsEnum([
    'shopify', 'woocommerce', 'prestashop', 'magento', 
    'odoo', 'bigcommerce', 'wix', 'squarespace', 
    'wordpress', 'drupal', 'joomla',
    'custom', 'autre', 'none'
  ])
  existingWebsitePlatform?: string;

  @ApiPropertyOptional({
    description: 'Souhaite connecter son site existant au dashboard',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  wantsToConnectExistingSite?: boolean;

  @ApiPropertyOptional({
    description: 'Souhaite créer un nouveau site',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  wantsToCreateNewSite?: boolean;

  @ApiPropertyOptional({
    description: 'Taille de votre équipe',
    enum: ['solo', '2-5', '6-10', '11-50', '50_plus'],
    example: 'solo'
  })
  @IsOptional()
  @IsEnum(['solo', '2-5', '6-10', '11-50', '50_plus'])
  teamSize?: string;

  @ApiPropertyOptional({
    description: 'Notes ou commentaires supplémentaires',
    example: 'Je souhaite me spécialiser dans le dropshipping'
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiPropertyOptional({
    description: 'Difficultés rencontrées en e-commerce (texte libre)',
    example: 'Acquisition clients, logistique, retours'
  })
  @IsOptional()
  @IsString()
  ecommerceDifficulties?: string;

  @ApiPropertyOptional({
    description: 'Autres difficultés (champ libre)',
    example: 'Problèmes de packaging'
  })
  @IsOptional()
  @IsString()
  otherDomainDifficulties?: string;

  @ApiPropertyOptional({
    description: 'Préférence d\'architecture du site',
    enum: ['simple','catalog','marketplace','blog','custom'],
    example: 'catalog'
  })
  @IsOptional()
  @IsEnum(['simple','catalog','marketplace','blog','custom'])
  siteArchitecturePreference?: string;

  @ApiPropertyOptional({
    description: 'Fonctionnalités avancées souhaitées',
    type: [String],
    example: ['Multilingue','Abonnements']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  advancedFeatures?: string[];

  @ApiPropertyOptional({
    description: 'Souhaite que la plateforme achète/registre un domaine',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  buyDomain?: boolean;

  @ApiPropertyOptional({
    description: 'Nom de domaine souhaité',
    example: 'monsite.fr'
  })
  @IsOptional()
  @IsString()
  desiredDomainName?: string;

  @ApiPropertyOptional({
    description: 'Fournisseur ou préférence de registrar (optionnel)',
    example: 'OVH'
  })
  @IsOptional()
  @IsString()
  domainProvider?: string;
}

export class OnboardingSurveyResponseDto {
  @ApiProperty({ description: 'ID du questionnaire' })
  id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  userId: string;

  @ApiProperty({ description: 'ID du tenant' })
  tenantId: string;

  @ApiProperty({ description: 'Questionnaire complété' })
  completed: boolean;

  @ApiProperty({ description: 'Date de complétion' })
  completedAt?: Date;

  @ApiProperty({ description: 'Source de découverte' })
  discoverySource: string;

  @ApiProperty({ description: 'Expérience e-commerce' })
  ecommerceExperience: string;

  @ApiProperty({ description: 'Objectif principal' })
  mainGoal: string;
}
