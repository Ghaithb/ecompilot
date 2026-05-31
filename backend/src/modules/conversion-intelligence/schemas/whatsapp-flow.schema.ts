import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppFlowStepType = 'wait_hours' | 'send_whatsapp' | 'send_sms';

export type WhatsAppFlowTrigger = 'cart_abandoned' | 'order_created' | 'cod_pending';

export interface WhatsAppFlowStep {
  id: string;
  type: WhatsAppFlowStepType;
  label: string;
  params: {
    hours?: number;
    template?: string;
    message?: string;
  };
}

export interface WhatsAppFlowDefinition {
  id: string;
  name: string;
  trigger: WhatsAppFlowTrigger;
  enabled: boolean;
  steps: WhatsAppFlowStep[];
}

export type TenantWhatsAppFlowsDocument = TenantWhatsAppFlows & Document;

@Schema({ timestamps: true })
export class TenantWhatsAppFlows {
  @Prop({ required: true, unique: true, index: true })
  tenantId: string;

  @Prop({ type: [Object], default: [] })
  flows: WhatsAppFlowDefinition[];
}

export const TenantWhatsAppFlowsSchema = SchemaFactory.createForClass(TenantWhatsAppFlows);
