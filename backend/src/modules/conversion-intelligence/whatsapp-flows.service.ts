import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TenantWhatsAppFlows,
  TenantWhatsAppFlowsDocument,
  WhatsAppFlowDefinition,
  WhatsAppFlowStep,
} from './schemas/whatsapp-flow.schema';

export const DEFAULT_WHATSAPP_FLOWS: WhatsAppFlowDefinition[] = [
  {
    id: 'abandoned-j1',
    name: 'Panier abandonné — relance J+1',
    trigger: 'cart_abandoned',
    enabled: true,
    steps: [
      { id: 's1', type: 'wait_hours', label: 'Attendre 24h', params: { hours: 24 } },
      {
        id: 's2',
        type: 'send_whatsapp',
        label: 'WhatsApp rappel panier',
        params: {
          template: 'cart_recovery',
          message: 'Bonjour {{name}}, votre panier de {{amount}} TND vous attend. Finalisez en 1 clic.',
        },
      },
    ],
  },
  {
    id: 'abandoned-j3-sms',
    name: 'Panier abandonné — SMS J+3',
    trigger: 'cart_abandoned',
    enabled: false,
    steps: [
      { id: 's1', type: 'wait_hours', label: 'Attendre 72h', params: { hours: 72 } },
      {
        id: 's2',
        type: 'send_sms',
        label: 'SMS fallback',
        params: { message: 'Votre commande COD est toujours disponible — {{link}}' },
      },
    ],
  },
  {
    id: 'order-confirm',
    name: 'Confirmation commande COD',
    trigger: 'order_created',
    enabled: true,
    steps: [
      {
        id: 's1',
        type: 'send_whatsapp',
        label: 'WhatsApp confirmation',
        params: {
          template: 'order_confirmation',
          message: 'Commande #{{orderNumber}} confirmée · {{amount}} TND à la livraison.',
        },
      },
    ],
  },
  {
    id: 'cod-otp',
    name: 'Rappel OTP COD',
    trigger: 'cod_pending',
    enabled: true,
    steps: [
      { id: 's1', type: 'wait_hours', label: 'Attendre 2h', params: { hours: 2 } },
      {
        id: 's2',
        type: 'send_whatsapp',
        label: 'Rappel vérification téléphone',
        params: { message: 'Confirmez votre commande COD avec le code reçu par SMS.' },
      },
    ],
  },
];

@Injectable()
export class WhatsAppFlowsService {
  constructor(
    @InjectModel(TenantWhatsAppFlows.name)
    private flowsModel: Model<TenantWhatsAppFlowsDocument>,
  ) {}

  private mergeDefaults(stored: WhatsAppFlowDefinition[] | undefined): WhatsAppFlowDefinition[] {
    const byId = new Map((stored ?? []).map((f) => [f.id, f]));
    return DEFAULT_WHATSAPP_FLOWS.map((preset) => {
      const saved = byId.get(preset.id);
      if (!saved) return preset;
      return {
        ...preset,
        enabled: saved.enabled,
        steps: saved.steps?.length ? saved.steps : preset.steps,
      };
    });
  }

  async list(tenantId: string) {
    const doc = await this.flowsModel.findOne({ tenantId }).lean();
    return { flows: this.mergeDefaults(doc?.flows), presets: DEFAULT_WHATSAPP_FLOWS.length };
  }

  async upsertFlow(tenantId: string, flow: WhatsAppFlowDefinition) {
    let doc = await this.flowsModel.findOne({ tenantId });
    const flows = this.mergeDefaults(doc?.flows);
    const idx = flows.findIndex((f) => f.id === flow.id);
    if (idx === -1) throw new NotFoundException('Flow inconnu');
    flows[idx] = { ...flows[idx], ...flow, id: flows[idx].id };
    if (!doc) {
      doc = await this.flowsModel.create({ tenantId, flows });
    } else {
      doc.flows = flows;
      await doc.save();
    }
    return { flows: this.mergeDefaults(doc.flows) };
  }

  async toggleFlow(tenantId: string, flowId: string, enabled: boolean) {
    const { flows } = await this.list(tenantId);
    const flow = flows.find((f) => f.id === flowId);
    if (!flow) throw new NotFoundException('Flow inconnu');
    return this.upsertFlow(tenantId, { ...flow, enabled });
  }

  async updateStep(tenantId: string, flowId: string, stepId: string, patch: Partial<WhatsAppFlowStep>) {
    const { flows } = await this.list(tenantId);
    const flow = flows.find((f) => f.id === flowId);
    if (!flow) throw new NotFoundException('Flow inconnu');
    flow.steps = flow.steps.map((s) => (s.id === stepId ? { ...s, ...patch, id: s.id } : s));
    return this.upsertFlow(tenantId, flow);
  }
}
