import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AlertRuleDocument = HydratedDocument<AlertRule>;

@Schema({ timestamps: true })
export class AlertRule {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['sales', 'orders', 'aov', 'inventory', 'roi', 'cpa', 'traffic'] })
  metric: string;

  @Prop({ required: true, enum: ['gt', 'lt', 'eq', 'gte', 'lte', 'diff_pct'] })
  operator: string;

  @Prop({ required: true })
  threshold: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: [String], default: [] })
  channels: string[];
}

export const AlertRuleSchema = SchemaFactory.createForClass(AlertRule);
