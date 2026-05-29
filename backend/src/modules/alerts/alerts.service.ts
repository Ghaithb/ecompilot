import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AlertRule, AlertRuleDocument } from './schemas/alert-rule.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(AlertRule.name) private alertRuleModel: Model<AlertRuleDocument>,
  ) {}

  /**
   * Créer une règle d'alerte
   */
  async createRule(tenantId: string, ruleData: any): Promise<AlertRule> {
    const rule = new this.alertRuleModel({
      ...ruleData,
      tenantId,
    });

    await rule.save();
    this.logger.log(`Règle d'alerte créée: ${rule.name} pour tenant ${tenantId}`);
    return rule;
  }

  /**
   * Lister les règles d'alerte
   */
  async listRules(tenantId: string): Promise<AlertRule[]> {
    return this.alertRuleModel.find({ tenantId }).exec();
  }

  /**
   * Mettre à jour une règle
   */
  async updateRule(tenantId: string, ruleId: string, updateData: any): Promise<AlertRule> {
    const rule = await this.alertRuleModel.findOneAndUpdate(
      { _id: ruleId, tenantId },
      { $set: updateData },
      { new: true },
    ).exec();

    if (!rule) {
      throw new Error('Règle non trouvée');
    }

    this.logger.log(`Règle d'alerte mise à jour: ${ruleId}`);
    return rule;
  }

  /**
   * Supprimer une règle
   */
  async deleteRule(tenantId: string, ruleId: string): Promise<void> {
    await this.alertRuleModel.deleteOne({ _id: ruleId, tenantId }).exec();
    this.logger.log(`Règle d'alerte supprimée: ${ruleId}`);
  }

  /**
   * Évaluer les règles d'alerte
   */
  async evaluateRules(tenantId: string, metrics: any): Promise<any[]> {
    const rules = await this.alertRuleModel.find({ tenantId, active: true }).exec();
    const triggeredAlerts = [];

    for (const rule of rules) {
      const metricValue = metrics[rule.metric];
      if (metricValue === undefined) continue;

      let triggered = false;

      switch (rule.operator) {
        case 'gt':
          triggered = metricValue > rule.threshold;
          break;
        case 'lt':
          triggered = metricValue < rule.threshold;
          break;
        case 'gte':
          triggered = metricValue >= rule.threshold;
          break;
        case 'lte':
          triggered = metricValue <= rule.threshold;
          break;
        case 'eq':
          triggered = metricValue === rule.threshold;
          break;
        case 'diff_pct':
          // Pourcentage de différence par rapport au seuil
          const diff = Math.abs((metricValue - rule.threshold) / rule.threshold) * 100;
          triggered = diff > rule.threshold;
          break;
      }

      if (triggered) {
        triggeredAlerts.push({
          ruleId: rule._id,
          ruleName: rule.name,
          metric: rule.metric,
          operator: rule.operator,
          threshold: rule.threshold,
          currentValue: metricValue,
          channels: rule.channels,
          timestamp: new Date(),
        });
      }
    }

    if (triggeredAlerts.length > 0) {
      this.logger.warn(`${triggeredAlerts.length} alerte(s) déclenchée(s) pour tenant ${tenantId}`);
    }

    return triggeredAlerts;
  }

  /**
   * Lister toutes les alertes (stock, financement, KPI)
   */
  async list(tenantId: string) {
    // Alertes de stock (existant)
    const stockAlerts = [
      { type: 'stock', message: 'Stock faible sur SKU1', level: 'warning', category: 'inventory' },
    ];

    // Alertes de financement
    const financingAlerts = [
      { type: 'financing', message: 'Nouvelle opportunité de financement disponible', level: 'info', category: 'financing' },
    ];

    // Alertes KPI (basées sur les règles)
    const kpiAlerts = [];
    const rules = await this.alertRuleModel.find({ tenantId, active: true }).exec();
    
    // Simuler des métriques pour démonstration
    const mockMetrics = {
      sales: 15000,
      orders: 120,
      aov: 125,
      inventory: 500,
      roi: 2.5,
      cpa: 45,
      traffic: 5000,
    };

    const triggered = await this.evaluateRules(tenantId, mockMetrics);
    for (const alert of triggered) {
      kpiAlerts.push({
        type: 'kpi',
        message: `${alert.ruleName}: ${alert.metric} = ${alert.currentValue} (seuil: ${alert.threshold})`,
        level: 'warning',
        category: 'kpi',
        details: alert,
      });
    }

    return [...stockAlerts, ...financingAlerts, ...kpiAlerts];
  }

  /**
   * Tâche planifiée pour évaluer les règles d'alerte
   */
  @Cron(CronExpression.EVERY_HOUR)
  async evaluateAllRules() {
    this.logger.log(' Évaluation des règles d\'alerte...');
    
    // TODO: Récupérer tous les tenants actifs et évaluer leurs règles
    // Pour l'instant, c'est un placeholder
    
    this.logger.log(' Évaluation des règles terminée');
  }
}
