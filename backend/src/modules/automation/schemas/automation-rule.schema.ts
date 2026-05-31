import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AutomationRuleDocument = AutomationRule & Document;

@Schema({ timestamps: true })
export class AutomationRule {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  trigger: string;

  @Prop({ type: Object, required: true })
  conditions: Record<string, unknown>;

  @Prop({ type: Array, default: [] })
  actions: Array<{ type: string; params?: Record<string, unknown> }>;

  @Prop({ default: true })
  isActive: boolean;
}

export const AutomationRuleSchema = SchemaFactory.createForClass(AutomationRule);
