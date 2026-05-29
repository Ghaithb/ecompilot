import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget, BudgetDocument } from './schemas/budget.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
  ) {}

  /**
   * Créer un nouveau budget
   */
  async create(tenantId: string, createBudgetDto: any): Promise<Budget> {
    const budget = new this.budgetModel({
      ...createBudgetDto,
      tenantId,
      remaining: createBudgetDto.totalBudget,
      spent: 0,
    });

    await (budget as any).save();
    this.logger.log(`Budget créé: ${budget.name} pour tenant ${tenantId}`);
    return budget;
  }

  /**
   * Récupérer tous les budgets d'un tenant
   */
  async findAll(tenantId: string, filters?: any): Promise<Budget[]> {
    const query: any = { tenantId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.platform) {
      query.platform = filters.platform;
    }

    return this.budgetModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Récupérer un budget par ID
   */
  async findOne(tenantId: string, budgetId: string): Promise<Budget> {
    const budget = await this.budgetModel.findOne({
      _id: new Types.ObjectId(budgetId),
      tenantId,
    }).exec();

    if (!budget) {
      throw new NotFoundException('Budget non trouvé');
    }

    return budget;
  }

  /**
   * Mettre à jour un budget
   */
  async update(tenantId: string, budgetId: string, updateBudgetDto: any): Promise<Budget> {
    const budget = await this.findOne(tenantId, budgetId);

    Object.assign(budget, updateBudgetDto);
    budget.updatedAt = new Date();

    // Recalculer remaining si totalBudget change
    if (updateBudgetDto.totalBudget !== undefined) {
      budget.remaining = updateBudgetDto.totalBudget - budget.spent;
    }

    await (budget as any).save();
    this.logger.log(`Budget mis à jour: ${budgetId}`);
    return budget;
  }

  /**
   * Supprimer un budget
   */
  async remove(tenantId: string, budgetId: string): Promise<void> {
    const result = await this.budgetModel.deleteOne({
      _id: new Types.ObjectId(budgetId),
      tenantId,
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Budget non trouvé');
    }

    this.logger.log(`Budget supprimé: ${budgetId}`);
  }

  /**
   * Enregistrer une dépense
   */
  async recordSpending(tenantId: string, budgetId: string, amount: number, metrics?: any): Promise<Budget> {
    const budget = await this.findOne(tenantId, budgetId);

    budget.spent += amount;
    budget.remaining = budget.totalBudget - budget.spent;

    // Mettre à jour les métriques si fournies
    if (metrics) {
      budget.metrics = { ...budget.metrics, ...metrics };
    }

    // Vérifier si le seuil d'alerte est atteint
    const percentageSpent = (budget.spent / budget.totalBudget) * 100;
    if (percentageSpent >= budget.alertThreshold && !budget.alertsSent.includes('threshold')) {
      budget.alertsSent.push('threshold');
      this.logger.warn(`⚠️ Budget ${budget.name} a atteint ${percentageSpent.toFixed(1)}% de dépenses`);
      // TODO: Envoyer une notification
    }

    // Vérifier si le budget est dépassé
    if (budget.spent >= budget.totalBudget && budget.status !== 'exceeded') {
      budget.status = 'exceeded';
      budget.alertsSent.push('exceeded');
      this.logger.warn(`🚨 Budget ${budget.name} dépassé!`);
      // TODO: Envoyer une notification
    }

    budget.updatedAt = new Date();
    await (budget as any).save();

    return budget;
  }

  /**
   * Obtenir des recommandations de réallocation de budget
   */
  async getRecommendations(tenantId: string): Promise<any> {
    const budgets = await this.findAll(tenantId, { status: 'active' });

    const recommendations = [];

    for (const budget of budgets) {
      const percentageSpent = (budget.spent / budget.totalBudget) * 100;
      const daysRemaining = Math.ceil((budget.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const dailyBudget = budget.totalBudget / Math.ceil((budget.endDate.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentDailySpend = budget.spent / Math.ceil((Date.now() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Recommandation si sous-utilisation
      if (percentageSpent < 50 && daysRemaining < 7) {
        recommendations.push({
          budgetId: (budget as any)._id,
          budgetName: budget.name,
          type: 'increase_spending',
          priority: 'high',
          message: `Budget sous-utilisé (${percentageSpent.toFixed(1)}%) avec seulement ${daysRemaining} jours restants`,
          suggestedDailyBudget: (budget.remaining / daysRemaining).toFixed(2),
          currentDailySpend: currentDailySpend.toFixed(2),
        });
      }

      // Recommandation si sur-utilisation
      if (percentageSpent > 80 && daysRemaining > 7) {
        recommendations.push({
          budgetId: (budget as any)._id,
          budgetName: budget.name,
          type: 'reduce_spending',
          priority: 'high',
          message: `Budget utilisé à ${percentageSpent.toFixed(1)}% avec ${daysRemaining} jours restants`,
          suggestedDailyBudget: (budget.remaining / daysRemaining).toFixed(2),
          currentDailySpend: currentDailySpend.toFixed(2),
        });
      }

      // Recommandation basée sur ROAS
      if (budget.metrics?.roas && budget.metrics.roas > 3) {
        recommendations.push({
          budgetId: (budget as any)._id,
          budgetName: budget.name,
          type: 'increase_budget',
          priority: 'medium',
          message: `Excellent ROAS de ${budget.metrics.roas.toFixed(2)}x - considérer augmenter le budget`,
          currentROAS: budget.metrics.roas,
        });
      }

      if (budget.metrics?.roas && budget.metrics.roas < 1) {
        recommendations.push({
          budgetId: (budget as any)._id,
          budgetName: budget.name,
          type: 'pause_or_optimize',
          priority: 'high',
          message: `ROAS faible de ${budget.metrics.roas.toFixed(2)}x - optimiser ou mettre en pause`,
          currentROAS: budget.metrics.roas,
        });
      }
    }

    return {
      totalBudgets: budgets.length,
      recommendations,
      summary: {
        totalAllocated: budgets.reduce((sum, b) => sum + b.totalBudget, 0),
        totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
        totalRemaining: budgets.reduce((sum, b) => sum + b.remaining, 0),
      },
    };
  }

  /**
   * Simuler l'impact d'une réallocation de budget
   */
  async simulateReallocation(tenantId: string, reallocationPlan: any): Promise<any> {
    const { fromBudgetId, toBudgetId, amount } = reallocationPlan;

    const fromBudget = await this.findOne(tenantId, fromBudgetId);
    const toBudget = await this.findOne(tenantId, toBudgetId);

    if (fromBudget.remaining < amount) {
      throw new BadRequestException('Montant de réallocation supérieur au budget restant');
    }

    // Simulation sans modification réelle
    const simulation = {
      fromBudget: {
        id: (fromBudget as any)._id,
        name: fromBudget.name,
        current: {
          totalBudget: fromBudget.totalBudget,
          spent: fromBudget.spent,
          remaining: fromBudget.remaining,
        },
        projected: {
          totalBudget: fromBudget.totalBudget - amount,
          spent: fromBudget.spent,
          remaining: fromBudget.remaining - amount,
        },
      },
      toBudget: {
        id: (toBudget as any)._id,
        name: toBudget.name,
        current: {
          totalBudget: toBudget.totalBudget,
          spent: toBudget.spent,
          remaining: toBudget.remaining,
        },
        projected: {
          totalBudget: toBudget.totalBudget + amount,
          spent: toBudget.spent,
          remaining: toBudget.remaining + amount,
        },
      },
      amount,
      impact: {
        fromBudgetPercentageChange: ((amount / fromBudget.totalBudget) * 100).toFixed(2),
        toBudgetPercentageChange: ((amount / toBudget.totalBudget) * 100).toFixed(2),
      },
    };

    return simulation;
  }

  /**
   * Tâche planifiée pour vérifier les budgets
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkBudgets() {
    this.logger.log('🔍 Vérification quotidienne des budgets...');

    const budgets = await this.budgetModel.find({ status: 'active' }).exec();

    for (const budget of budgets) {
      const percentageSpent = (budget.spent / budget.totalBudget) * 100;
      const daysRemaining = Math.ceil((budget.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      // Alerte si fin de période proche
      if (daysRemaining <= 3 && !budget.alertsSent.includes('ending_soon')) {
        budget.alertsSent.push('ending_soon');
        await (budget as any).save();
        this.logger.warn(`⏰ Budget ${budget.name} se termine dans ${daysRemaining} jours`);
        // TODO: Envoyer notification
      }

      // Marquer comme complété si période terminée
      if (daysRemaining <= 0 && budget.status === 'active') {
        budget.status = 'completed';
        await (budget as any).save();
        this.logger.log(`✅ Budget ${budget.name} complété`);
      }
    }
  }
}
