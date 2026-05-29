import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  campaignId?: string;

  @Prop({ required: true, enum: ['google_ads', 'meta_ads', 'tiktok_ads', 'linkedin_ads', 'twitter_ads', 'other'] })
  platform: string;

  @Prop({ required: true })
  totalBudget: number;

  @Prop({ default: 0 })
  spent: number;

  @Prop({ default: 0 })
  remaining: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ default: 'active', enum: ['active', 'paused', 'completed', 'exceeded'] })
  status: string;

  @Prop({ default: 80 })
  alertThreshold: number; // Pourcentage pour déclencher une alerte

  @Prop({ type: Object, default: {} })
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
    cpa?: number;
    roas?: number;
  };

  @Prop({ type: [String], default: [] })
  alertsSent: string[]; // Historique des alertes envoyées

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// Index pour les requêtes fréquentes
BudgetSchema.index({ tenantId: 1, status: 1 });
BudgetSchema.index({ tenantId: 1, platform: 1 });
BudgetSchema.index({ endDate: 1 });
