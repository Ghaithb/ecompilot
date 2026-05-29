import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
    maxStorage: number; // GB
  };
  stripePriceId?: string;
}

export interface TenantSubscription {
  tenantId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  metadata: Record<string, any>;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  
  private readonly plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Parfait pour commencer',
      price: 0,
      interval: 'month',
      features: [
        'Jusqu\'à 10 produits',
        'Jusqu\'à 50 commandes/mois',
        '1 utilisateur',
        '1GB de stockage',
        'Support email',
      ],
      limits: {
        maxProducts: 10,
        maxOrders: 50,
        maxUsers: 1,
        maxStorage: 1,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Pour les boutiques en croissance',
      price: 29,
      interval: 'month',
      features: [
        'Produits illimités',
        'Commandes illimitées',
        'Jusqu\'à 5 utilisateurs',
        '10GB de stockage',
        'Support prioritaire',
        'Analytics avancés',
        'Intégrations externes',
      ],
      limits: {
        maxProducts: -1, // illimité
        maxOrders: -1,
        maxUsers: 5,
        maxStorage: 10,
      },
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Pour les entreprises',
      price: 99,
      interval: 'month',
      features: [
        'Tout de Pro',
        'Utilisateurs illimités',
        '50GB de stockage',
        'Support téléphonique',
        'API personnalisée',
        'White-label',
        'Déploiement privé',
      ],
      limits: {
        maxProducts: -1,
        maxOrders: -1,
        maxUsers: -1,
        maxStorage: 50,
      },
      stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    },
  ];

  constructor(
    @InjectModel('TenantSubscription') private subscriptionModel: Model<TenantSubscription>,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  getAvailablePlans(): SubscriptionPlan[] {
    return this.plans;
  }

  async getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
    return this.subscriptionModel.findOne({ tenantId }).exec();
  }

  async createSubscription(
    tenantId: string,
    planId: string,
    stripeCustomerId?: string,
  ): Promise<TenantSubscription> {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) {
      throw new BadRequestException('Plan non trouvé');
    }

    // Vérifier si une subscription existe déjà
    const existing = await this.getTenantSubscription(tenantId);
    if (existing && existing.status === 'active') {
      throw new BadRequestException('Une subscription active existe déjà');
    }

    let stripeSubscriptionId: string | undefined;
    let subscriptionStatus: TenantSubscription['status'] = 'active';

    // Si c'est un plan payant et qu'on a un customer Stripe
    if (plan.price > 0 && plan.stripePriceId && stripeCustomerId) {
      try {
        const stripeSubscription = await this.stripeService.createSubscription(
          stripeCustomerId,
          plan.stripePriceId,
        );
        stripeSubscriptionId = stripeSubscription.id;
        subscriptionStatus = stripeSubscription.status as TenantSubscription['status'];
      } catch (error) {
        this.logger.error(`Erreur création subscription Stripe: ${error.message}`);
        throw new BadRequestException('Erreur lors de la création de l\'abonnement');
      }
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    if (plan.interval === 'month') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const subscription = new this.subscriptionModel({
      tenantId,
      planId,
      status: subscriptionStatus,
      stripeSubscriptionId,
      stripeCustomerId,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      metadata: {
        planName: plan.name,
        createdAt: new Date(),
      },
    });

    await this.subscriptionModel.updateOne({ tenantId: subscription.tenantId }, subscription, { upsert: true });
    this.logger.log(`Subscription créée pour tenant ${tenantId}: ${plan.name}`);

    return subscription;
  }

  async upgradeSubscription(
    tenantId: string,
    newPlanId: string,
  ): Promise<TenantSubscription> {
    const subscription = await this.getTenantSubscription(tenantId);
    if (!subscription) {
      throw new NotFoundException('Aucune subscription trouvée');
    }

    const newPlan = this.plans.find(p => p.id === newPlanId);
    if (!newPlan) {
      throw new BadRequestException('Nouveau plan non trouvé');
    }

    // Si on a une subscription Stripe, la mettre à jour
    if (subscription.stripeSubscriptionId && newPlan.stripePriceId) {
      try {
        await this.stripeService.updateSubscription(
          subscription.stripeSubscriptionId,
          newPlan.stripePriceId,
        );
      } catch (error) {
        this.logger.error(`Erreur mise à jour subscription Stripe: ${error.message}`);
        throw new BadRequestException('Erreur lors de la mise à jour de l\'abonnement');
      }
    }

    subscription.planId = newPlanId;
    subscription.metadata = {
      ...subscription.metadata,
      planName: newPlan.name,
      upgradedAt: new Date(),
    };

    await this.subscriptionModel.updateOne({ tenantId: subscription.tenantId }, subscription, { upsert: true });
    this.logger.log(`Subscription mise à jour pour tenant ${tenantId}: ${newPlan.name}`);

    return subscription;
  }

  async cancelSubscription(tenantId: string, atPeriodEnd = true): Promise<TenantSubscription> {
    const subscription = await this.getTenantSubscription(tenantId);
    if (!subscription) {
      throw new NotFoundException('Aucune subscription trouvée');
    }

    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId,
          atPeriodEnd,
        );
      } catch (error) {
        this.logger.error(`Erreur annulation subscription Stripe: ${error.message}`);
        throw new BadRequestException('Erreur lors de l\'annulation de l\'abonnement');
      }
    }

    subscription.cancelAtPeriodEnd = atPeriodEnd;
    if (!atPeriodEnd) {
      subscription.status = 'canceled';
    }

    await this.subscriptionModel.updateOne({ tenantId: subscription.tenantId }, subscription, { upsert: true });
    this.logger.log(`Subscription annulée pour tenant ${tenantId}`);

    return subscription;
  }

  async handleWebhookEvent(eventType: string, eventData: any): Promise<void> {
    switch (eventType) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(eventData);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(eventData);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(eventData);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(eventData);
        break;
      default:
        this.logger.log(`Événement Stripe non géré: ${eventType}`);
    }
  }

  async checkUsageLimits(tenantId: string, resource: 'products' | 'orders' | 'users' | 'storage'): Promise<{
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  }> {
    const subscription = await this.getTenantSubscription(tenantId);
    if (!subscription) {
      // Utiliser les limites du plan gratuit par défaut
      const freePlan = this.plans.find(p => p.id === 'free');
      const limit = freePlan ? freePlan.limits[resource] : 0;
      return { used: 0, limit, remaining: limit, canUse: true };
    }

    const plan = this.plans.find(p => p.id === subscription.planId);
    if (!plan) {
      throw new BadRequestException('Plan non trouvé');
    }

    const limit = plan.limits[resource];
    if (limit === -1) {
      // Illimité
      return { used: 0, limit: -1, remaining: -1, canUse: true };
    }

    // Calculer l'usage actuel (simplifié)
    const used = await this.calculateUsage(tenantId, resource);
    const remaining = Math.max(0, limit - used);
    const canUse = used < limit;

    return { used, limit, remaining, canUse };
  }

  private async handleSubscriptionUpdated(eventData: any): Promise<void> {
    const stripeSubscriptionId = eventData.id;
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    }).exec();

    if (subscription) {
      subscription.status = eventData.status;
      subscription.currentPeriodStart = new Date(eventData.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(eventData.current_period_end * 1000);
      subscription.cancelAtPeriodEnd = eventData.cancel_at_period_end;
      await subscription.save();
    }
  }

  private async handleSubscriptionDeleted(eventData: any): Promise<void> {
    const stripeSubscriptionId = eventData.id;
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    }).exec();

    if (subscription) {
      subscription.status = 'canceled';
      await subscription.save();
    }
  }

  private async handlePaymentFailed(eventData: any): Promise<void> {
    const stripeSubscriptionId = eventData.subscription;
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    }).exec();

    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
    }
  }

  private async handlePaymentSucceeded(eventData: any): Promise<void> {
    const stripeSubscriptionId = eventData.subscription;
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    }).exec();

    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
    }
  }

  private async calculateUsage(tenantId: string, resource: string): Promise<number> {
    // Implémentation simplifiée - à adapter selon vos modèles
    switch (resource) {
      case 'products':
        // return await this.productModel.countDocuments({ tenantId }).exec();
        return 0; // Placeholder
      case 'orders':
        // return await this.orderModel.countDocuments({ tenantId }).exec();
        return 0; // Placeholder
      case 'users':
        // return await this.userModel.countDocuments({ tenantId }).exec();
        return 0; // Placeholder
      case 'storage':
        // Calculer la taille des fichiers uploadés
        return 0; // Placeholder
      default:
        return 0;
    }
  }
}

// Remplacez `save` par une méthode équivalente ou implémentez une logique personnalisée pour sauvegarder `subscription`.




