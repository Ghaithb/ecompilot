import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TenantRecoveryConfig,
  TenantRecoveryConfigDocument,
} from './schemas/tenant-recovery-config.schema';

export type RecoveryChannel = 'email' | 'whatsapp' | 'sms';

export interface RecoveryDecision {
  shouldRecover: boolean;
  channels: RecoveryChannel[];
  discountPercent: number;
  delayMinutes: number | null;
  tier: 'none' | 'email' | 'multi' | 'urgent';
}

/**
 * Dynamic recovery decision engine — driven by conversionScore (0–100).
 * Higher score = more likely to convert without intervention.
 */
@Injectable()
export class RecoveryDecisionEngine {
  constructor(
    private config: ConfigService,
    @InjectModel(TenantRecoveryConfig.name)
    private tenantConfigModel: Model<TenantRecoveryConfigDocument>,
  ) {}

  decide(conversionScore: number, stage: number, tenantDiscountEnabled = true): RecoveryDecision {
    if (stage >= 3) {
      return { shouldRecover: false, channels: [], discountPercent: 0, delayMinutes: null, tier: 'none' };
    }

    if (conversionScore > 80) {
      return { shouldRecover: false, channels: [], discountPercent: 0, delayMinutes: null, tier: 'none' };
    }

    if (conversionScore >= 50) {
      return {
        shouldRecover: true,
        channels: ['email'],
        discountPercent: tenantDiscountEnabled && stage >= 1 ? 5 : 0,
        delayMinutes: stage === 0 ? 45 : stage === 1 ? 240 : 720,
        tier: 'email',
      };
    }

    if (conversionScore >= 30) {
      const channels: RecoveryChannel[] = stage === 0 ? ['email'] : ['email', 'whatsapp'];
      return {
        shouldRecover: true,
        channels,
        discountPercent: tenantDiscountEnabled && stage >= 1 ? 10 : 0,
        delayMinutes: stage === 0 ? 20 : stage === 1 ? 120 : 360,
        tier: 'multi',
      };
    }

    return {
      shouldRecover: true,
      channels: ['whatsapp', 'sms'],
      discountPercent: tenantDiscountEnabled ? (stage >= 1 ? 10 : 5) : 0,
      delayMinutes: stage === 0 ? 5 : stage === 1 ? 60 : 180,
      tier: 'urgent',
    };
  }

  async getTenantDiscountEnabled(tenantId: string): Promise<boolean> {
    const cfg = await this.tenantConfigModel.findOne({ tenantId }).lean();
    if (cfg) return cfg.discountEnabled;
    return this.config.get<boolean>('cart.recoveryDiscountEnabled') !== false;
  }

  async getMaxDiscount(tenantId: string): Promise<number> {
    const cfg = await this.tenantConfigModel.findOne({ tenantId }).lean();
    return cfg?.maxDiscountPercent ?? this.config.get<number>('cart.recoveryMaxDiscountPercent') ?? 10;
  }
}
