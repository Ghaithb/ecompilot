import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AutomationRule, AutomationRuleDocument } from './schemas/automation-rule.schema';

export type AutomationTrigger =
  | 'order.created'
  | 'order.delivered'
  | 'payment.failed'
  | 'shipment.delayed'
  | 'customer.inactive';

export type AutomationActionType =
  | 'send_whatsapp'
  | 'create_shipment'
  | 'assign_tag'
  | 'send_email'
  | 'create_coupon'
  | 'notify_admin';

export const AUTOMATION_TRIGGERS: AutomationTrigger[] = [
  'order.created',
  'order.delivered',
  'payment.failed',
  'shipment.delayed',
  'customer.inactive',
];

export const AUTOMATION_ACTIONS: AutomationActionType[] = [
  'send_whatsapp',
  'create_shipment',
  'assign_tag',
  'send_email',
  'create_coupon',
  'notify_admin',
];

import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectModel(AutomationRule.name) private ruleModel: Model<AutomationRuleDocument>,
    private readonly whatsapp: WhatsAppService,
  ) {}

  catalog() {
    return { triggers: AUTOMATION_TRIGGERS, actions: AUTOMATION_ACTIONS };
  }

  async listRules(tenantId: string) {
    return this.ruleModel.find({ tenantId: new Types.ObjectId(tenantId) }).sort({ createdAt: -1 }).lean();
  }

  async createRule(
    tenantId: string,
    payload: {
      name: string;
      trigger: AutomationTrigger;
      actions: Array<{ type: AutomationActionType; params?: Record<string, unknown> }>;
      conditions?: Record<string, unknown>;
    },
  ) {
    return this.ruleModel.create({
      tenantId: new Types.ObjectId(tenantId),
      name: payload.name,
      trigger: payload.trigger,
      actions: payload.actions,
      conditions: payload.conditions || {},
      isActive: true,
    });
  }

  async toggleRule(tenantId: string, ruleId: string, isActive: boolean) {
    return this.ruleModel.findOneAndUpdate(
      { _id: ruleId, tenantId: new Types.ObjectId(tenantId) },
      { isActive },
      { new: true },
    );
  }

  async dispatch(tenantId: string, trigger: AutomationTrigger, context: Record<string, unknown>) {
    const rules = await this.ruleModel.find({
      tenantId: new Types.ObjectId(tenantId),
      trigger,
      isActive: true,
    });

    const results: Array<{ ruleId: string; action: string; status: string }> = [];

    for (const rule of rules) {
      for (const action of rule.actions) {
        this.logger.log(`Automation ${rule.name}: ${action.type}`);
        
        let status = 'queued';
        let error: string | undefined;

        if (action.type === 'send_whatsapp' && context.phone) {
          try {
            const message = action.params?.message as string || 'Bonjour';
            const result = await this.whatsapp.sendTextMessage(tenantId, {
              to: context.phone as string,
              message,
            });
            status = result.success ? 'sent' : 'failed';
            error = result.error;
          } catch (err: any) {
            status = 'failed';
            error = err.message;
          }
        }

        results.push({
          ruleId: rule._id.toString(),
          action: action.type,
          status,
        });
      }
    }

    return { trigger, executed: results.length, results, context };
  }
}
