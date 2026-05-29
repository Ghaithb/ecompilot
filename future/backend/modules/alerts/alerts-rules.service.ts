import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AlertRule, AlertRuleDocument } from './schemas/alert-rule.schema';

@Injectable()
export class AlertsRulesService {
  constructor(
    @InjectModel(AlertRule.name) private alertRuleModel: Model<AlertRuleDocument>,
  ) {}

  private readonly logger = new Logger(AlertsRulesService.name);

  async list(tenantId: string) {
    return this.alertRuleModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
  }

  async create(tenantId: string, payload: Partial<AlertRule>) {
    const doc = new this.alertRuleModel({ ...payload, tenantId });
    await doc.save();
    return doc.toObject();
  }

  async update(tenantId: string, id: string, payload: Partial<AlertRule>) {
    return this.alertRuleModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), tenantId },
      { $set: payload },
      { new: true },
    ).lean();
  }

  async remove(tenantId: string, id: string) {
    await this.alertRuleModel.deleteOne({ _id: new Types.ObjectId(id), tenantId });
    return { deleted: true };
  }

  // Placeholder for scheduled evaluation of KPI rules
  async evaluateRules(_tenantId: string) {
    return { evaluated: true };
  }

  // Run every 30 minutes
  @Cron('0 */30 * * * *')
  async scheduledEvaluation() {
    try {
      const active = await this.alertRuleModel.distinct('tenantId', { active: true });
      for (const tenantId of active) {
        this.logger.log(`Evaluating KPI rules for tenant ${tenantId}`);
        await this.evaluateRules(String(tenantId));
      }
    } catch (e) {
      this.logger.error('Error during scheduled KPI rules evaluation', e as any);
    }
  }
}
