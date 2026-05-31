import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TenantRecoveryConfig,
  TenantRecoveryConfigDocument,
} from './schemas/tenant-recovery-config.schema';

export interface ExperimentAssignment {
  checkoutVersion: 'A' | 'B';
  recoveryMessageVariant: string;
  upsellStrategy: 'category' | 'metadata' | 'none';
}

/** Deterministic A/B — consistent hash per tenant + session. */
@Injectable()
export class ConversionExperimentService {
  constructor(
    @InjectModel(TenantRecoveryConfig.name)
    private tenantConfigModel: Model<TenantRecoveryConfigDocument>,
  ) {}

  assign(tenantId: string, sessionKey: string, salt = 'default'): ExperimentAssignment {
    const hash = this.hash(`${tenantId}:${salt}:${sessionKey}`);
    const checkoutVersion: 'A' | 'B' = hash % 2 === 0 ? 'A' : 'B';
    const recoveryMessageVariant = ['default', 'urgency', 'discount'][hash % 3];
    const upsellStrategy = ['category', 'metadata', 'none'][hash % 3] as ExperimentAssignment['upsellStrategy'];

    return { checkoutVersion, recoveryMessageVariant, upsellStrategy };
  }

  async assignForTenant(tenantId: string, sessionKey: string): Promise<ExperimentAssignment> {
    const cfg = await this.tenantConfigModel.findOne({ tenantId }).lean();
    const salt = cfg?.experimentSalt || 'default';
    return this.assign(tenantId, sessionKey, salt);
  }

  private hash(input: string): number {
    let h = 0;
    for (let i = 0; i < input.length; i += 1) {
      h = (h << 5) - h + input.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }
}
