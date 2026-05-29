import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { OnboardingSurvey, OnboardingSurveyDocument } from './schemas/onboarding-survey.schema';
import { CompleteOnboardingSurveyDto } from './dto/onboarding-survey.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OnboardingSurvey.name) private surveyModel: Model<OnboardingSurveyDocument>,
  ) {}

  // Obtenir le statut d'onboarding
  async getOnboardingStatus(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    
    if (!tenant) {
      return {
        completed: false,
        steps: {
          productsAdded: false,
          integrationsConfigured: false,
          firstCampaignLaunched: false,
        },
        progress: 0,
      };
    }

    // Vérifier chaque étape
    const productsCount = await this.productModel.countDocuments({ tenantId });
    const ordersCount = await this.orderModel.countDocuments({ tenantId });

    const steps = {
      productsAdded: productsCount > 0,
      integrationsConfigured: !!(tenant.integrations?.stripe || tenant.integrations?.shopify || (tenant.integrations as any)?.woocommerce),
      firstCampaignLaunched: ordersCount > 0 || !!(tenant as any).firstCampaignDate,
    };

    // Calculer la progression
    const completedSteps = Object.values(steps).filter(Boolean).length;
    const totalSteps = Object.keys(steps).length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    return {
      completed: progress === 100,
      steps,
      progress,
      stats: {
        productsCount,
        ordersCount,
        integrationsCount: Object.keys(tenant.integrations || {}).filter(k => (tenant.integrations as any)?.[k]).length || 0,
      },
    };
  }

  // Marquer une étape comme complétée
  async completeStep(tenantId: string, step: string) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    
    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    // Mettre à jour selon l'étape
    switch (step) {
      case 'productsAdded':
        // Vérifier si des produits existent
        const productsCount = await this.productModel.countDocuments({ tenantId });
        if (productsCount === 0) {
          throw new Error('Aucun produit trouvé. Ajoutez au moins un produit.');
        }
        break;

      case 'integrationsConfigured':
        // Vérifier si des intégrations existent
        if (!tenant.integrations || Object.keys(tenant.integrations).filter(k => (tenant.integrations as any)?.[k]).length === 0) {
          throw new Error('Aucune intégration configurée.');
        }
        break;

      case 'firstCampaignLaunched':
        // Marquer la date de première campagne
        if (!(tenant as any).firstCampaignDate) {
          (tenant as any).firstCampaignDate = new Date();
          await tenant.save();
        }
        break;

      default:
        throw new Error(`Étape inconnue: ${step}`);
    }

    // Vérifier si l'onboarding est complet
    const status = await this.getOnboardingStatus(tenantId);
    
    if (status.completed && !(tenant as any).onboardingCompleted) {
      (tenant as any).onboardingCompleted = true;
      (tenant as any).onboardingCompletedAt = new Date();
      await tenant.save();
    }

    return status;
  }

  // Réinitialiser l'onboarding (pour les tests)
  async resetOnboarding(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    
    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    (tenant as any).onboardingCompleted = false;
    (tenant as any).onboardingCompletedAt = null;
    (tenant as any).firstCampaignDate = null;
    await tenant.save();

    return {
      success: true,
      message: 'Onboarding réinitialisé',
    };
  }

  // === QUESTIONNAIRE D'ONBOARDING ===

  /**
   * Vérifier si l'utilisateur a complété le questionnaire
   */
  async hasSurveyCompleted(userId: string): Promise<boolean> {
    const survey = await this.surveyModel.findOne({ userId, completed: true }).exec();
    return !!survey;
  }

  /**
   * Obtenir le questionnaire d'un utilisateur
   */
  async getSurvey(userId: string) {
    const survey = await this.surveyModel.findOne({ userId }).exec();
    
    if (!survey) {
      return {
        exists: false,
        completed: false,
        message: 'Aucun questionnaire trouvé',
      };
    }

    return {
      exists: true,
      completed: survey.completed,
      survey: survey.toObject(),
    };
  }

  /**
   * Compléter le questionnaire d'onboarding
   */
  async completeSurvey(userId: string, tenantId: string, surveyData: CompleteOnboardingSurveyDto) {
    // Vérifier si le questionnaire existe déjà
    let survey = await this.surveyModel.findOne({ userId }).exec();

    if (survey) {
      // Mettre à jour le questionnaire existant
      Object.assign(survey, surveyData);
      survey.completed = true;
      survey.completedAt = new Date();
      await survey.save();
    } else {
      // Créer un nouveau questionnaire
      survey = await this.surveyModel.create({
        userId,
        tenantId,
        ...surveyData,
        completed: true,
        completedAt: new Date(),
      });
    }

    // Générer des recommandations personnalisées basées sur les réponses
    const recommendations = this.generateRecommendations(surveyData);

    return {
      success: true,
      message: 'Questionnaire complété avec succès',
      survey: survey.toObject(),
      recommendations,
    };
  }

  /**
   * Générer des recommandations personnalisées basées sur le questionnaire
   */
  private generateRecommendations(surveyData: CompleteOnboardingSurveyDto) {
    const recommendations = [];

    // Recommandations basées sur le type d'activité
    switch (surveyData.businessType) {
      case 'restaurant':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Créez votre menu en ligne',
          description: 'Générez un site web avec votre menu et système de réservation',
          action: '/website/wizard?type=restaurant',
        });
        recommendations.push({
          category: 'Réservations',
          priority: 'high',
          title: 'Système de réservation',
          description: 'Permettez à vos clients de réserver en ligne',
          action: '/website/bookings',
        });
        break;

      case 'cafe':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Site web pour votre café',
          description: 'Présentez votre ambiance, menu et horaires',
          action: '/website/wizard?type=cafe',
        });
        recommendations.push({
          category: 'Social Media',
          priority: 'high',
          title: 'Présence sur les réseaux sociaux',
          description: 'Instagram est essentiel pour les cafés',
          action: '/social-media',
        });
        break;

      case 'service':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Site vitrine professionnel',
          description: 'Présentez vos services et expertise',
          action: '/website/wizard?type=service',
        });
        recommendations.push({
          category: 'Réservations',
          priority: 'medium',
          title: 'Prise de rendez-vous en ligne',
          description: 'Facilitez la prise de rendez-vous',
          action: '/website/bookings',
        });
        break;

      case 'marketplace':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Plateforme marketplace',
          description: 'Créez une marketplace multi-vendeurs',
          action: '/website/wizard?type=marketplace',
        });
        recommendations.push({
          category: 'Vendeurs',
          priority: 'high',
          title: 'Gestion des vendeurs',
          description: 'Outils pour gérer vos vendeurs',
          action: '/admin/vendors',
        });
        break;

      case 'blog':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Site blog moderne',
          description: 'Créez votre blog avec éditeur intégré',
          action: '/website/wizard?type=blog',
        });
        recommendations.push({
          category: 'Content',
          priority: 'high',
          title: 'Création de contenu',
          description: 'Utilisez l\'IA pour générer du contenu',
          action: '/ai-copilot',
        });
        break;

      case 'portfolio':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Portfolio professionnel',
          description: 'Présentez vos réalisations',
          action: '/website/wizard?type=portfolio',
        });
        recommendations.push({
          category: 'Galerie',
          priority: 'medium',
          title: 'Galerie de projets',
          description: 'Gérez vos images et projets',
          action: '/media-gallery',
        });
        break;

      case 'ecommerce':
      default:
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Boutique en ligne',
          description: 'Créez votre boutique e-commerce',
          action: '/website/wizard?type=ecommerce',
        });
        recommendations.push({
          category: 'Produits',
          priority: 'high',
          title: 'Ajoutez vos produits',
          description: 'Commencez par ajouter vos produits',
          action: '/products',
        });
        break;
    }

    // Recommandations basées sur l'expérience
    if (surveyData.ecommerceExperience === 'debutant' || surveyData.ecommerceExperience === '0-1_an') {
      recommendations.push({
        category: 'Formation',
        priority: 'high',
        title: 'Guides pour débutants',
        description: 'Consultez nos guides pour bien démarrer votre boutique en ligne',
        action: '/resources/beginner-guides',
      });
    }

    // Recommandations basées sur l'objectif
    switch (surveyData.mainGoal) {
      case 'lancer_boutique':
        recommendations.push({
          category: 'Setup',
          priority: 'high',
          title: 'Créez votre premier site web',
          description: 'Utilisez notre générateur de site pour créer votre boutique en quelques clics',
          action: '/website/wizard',
        });
        recommendations.push({
          category: 'Produits',
          priority: 'high',
          title: 'Ajoutez vos produits',
          description: 'Importez ou créez vos premiers produits',
          action: '/products',
        });
        break;

      case 'augmenter_ventes':
        recommendations.push({
          category: 'Marketing',
          priority: 'high',
          title: 'Configurez vos campagnes marketing',
          description: 'Créez des campagnes pour augmenter vos ventes',
          action: '/marketing',
        });
        recommendations.push({
          category: 'AI',
          priority: 'medium',
          title: 'Utilisez l\'IA pour optimiser',
          description: 'L\'IA vous aide à optimiser vos prix et votre marketing',
          action: '/ai-copilot',
        });
        break;

      case 'automatiser_processus':
        recommendations.push({
          category: 'Intégrations',
          priority: 'high',
          title: 'Connectez vos outils',
          description: 'Automatisez votre business avec nos intégrations',
          action: '/integrations',
        });
        break;

      case 'ameliorer_marketing':
        recommendations.push({
          category: 'Marketing',
          priority: 'high',
          title: 'Campagnes email automatisées',
          description: 'Récupérez les paniers abandonnés et fidélisez vos clients',
          action: '/email-marketing',
        });
        recommendations.push({
          category: 'Social Media',
          priority: 'medium',
          title: 'Gérez vos réseaux sociaux',
          description: 'Publiez sur tous vos réseaux depuis un seul endroit',
          action: '/social-media',
        });
        break;
    }

    // Recommandations basées sur les plateformes utilisées
    if (surveyData.usedEcommercePlatforms?.includes('Shopify')) {
      recommendations.push({
        category: 'Intégrations',
        priority: 'medium',
        title: 'Connectez Shopify',
        description: 'Synchronisez automatiquement vos produits Shopify',
        action: '/integrations?platform=shopify',
      });
    }

    // Recommandations basées sur le budget
    if (surveyData.marketingBudget === 'moins_100' || surveyData.marketingBudget === 'pas_encore_defini') {
      recommendations.push({
        category: 'Budget',
        priority: 'low',
        title: 'Marketing gratuit',
        description: 'Découvrez nos stratégies de marketing à faible coût',
        action: '/resources/low-budget-marketing',
      });
    }

    // Recommandations basées sur la taille de l'équipe
    if (surveyData.teamSize === 'solo') {
      recommendations.push({
        category: 'Automatisation',
        priority: 'medium',
        title: 'Automatisez votre boutique',
        description: 'Gagnez du temps avec nos outils d\'automatisation',
        action: '/integrations',
      });
    }

    // Chatbot si pas d'expérience
    if (!surveyData.hasPreviousExperience) {
      recommendations.push({
        category: 'Support',
        priority: 'medium',
        title: 'Configurez votre chatbot',
        description: 'Un assistant virtuel pour répondre à vos clients 24/7',
        action: '/chatbot-config',
      });
    }

    return recommendations;
  }

  /**
   * Obtenir des statistiques sur les questionnaires (pour admin)
   */
  async getSurveyStats() {
    const totalSurveys = await this.surveyModel.countDocuments().exec();
    const completedSurveys = await this.surveyModel.countDocuments({ completed: true }).exec();

    // Statistiques par source de découverte
    const discoveryStats = await this.surveyModel.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$discoverySource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();

    // Statistiques par expérience
    const experienceStats = await this.surveyModel.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$ecommerceExperience', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();

    // Statistiques par objectif
    const goalStats = await this.surveyModel.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$mainGoal', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).exec();

    return {
      total: totalSurveys,
      completed: completedSurveys,
      completionRate: totalSurveys > 0 ? Math.round((completedSurveys / totalSurveys) * 100) : 0,
      discoveryStats,
      experienceStats,
      goalStats,
    };
  }

  // Obtenir les prochaines étapes recommandées
  async getNextSteps(tenantId: string) {
    const status = await this.getOnboardingStatus(tenantId);

    const recommendations = [];

    if (!status.steps.productsAdded) {
      recommendations.push({
        step: 'productsAdded',
        title: 'Ajoutez vos premiers produits',
        description: 'Commencez par ajouter au moins un produit à votre catalogue',
        action: '/products/new',
        priority: 'high',
      });
    }

    if (!status.steps.integrationsConfigured) {
      recommendations.push({
        step: 'integrationsConfigured',
        title: 'Configurez vos intégrations',
        description: 'Connectez Shopify, WooCommerce ou d\'autres plateformes',
        action: '/integrations',
        priority: 'medium',
      });
    }

    if (!status.steps.firstCampaignLaunched) {
      recommendations.push({
        step: 'firstCampaignLaunched',
        title: 'Lancez votre première campagne',
        description: 'Créez et lancez votre première campagne marketing',
        action: '/marketing/campaigns/new',
        priority: 'medium',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        step: 'completed',
        title: 'Félicitations ! 🎉',
        description: 'Vous avez terminé l\'onboarding. Explorez maintenant toutes les fonctionnalités.',
        action: '/dashboard',
        priority: 'low',
      });
    }

    return {
      status,
      recommendations,
    };
  }
}
