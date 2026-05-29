import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CodTrustService } from '../../cod-trust/cod-trust.service';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import { normalizeTunisianPhone } from '../../../common/utils/phone.util';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface OrderRiskAssessment {
  score: number;
  level: RiskLevel;
  factors: string[];
  allowed: boolean;
  phone: string;
}

@Injectable()
export class OrderRiskEngineService {
  constructor(
    private codTrust: CodTrustService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async assessOrder(tenantId: string, phone: string, ip?: string): Promise<OrderRiskAssessment> {
    const normalized = normalizeTunisianPhone(phone);
    const factors: string[] = [];
    let score = 50;

    const cod = await this.codTrust.getTrustScore(tenantId, normalized);
    score = Math.round((score + cod.score) / 2);
    if (cod.level === 'suspect') {
      factors.push('Historique COD suspect');
      score -= 15;
    }
    if (cod.level === 'blocked') {
      factors.push('Client blacklisté');
      score = 0;
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await this.orderModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
      'shippingAddress.phone': normalized,
      createdAt: { $gte: since24h },
    });
    if (recentCount >= 3) {
      factors.push(`${recentCount} commandes en 24h`);
      score -= 20;
    }

    const refusedCount = await this.orderModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
      'shippingAddress.phone': normalized,
      status: { $in: ['refused', 'returned_to_seller', 'cancelled'] },
    });
    if (refusedCount >= 2) {
      factors.push(`${refusedCount} refus/annulations`);
      score -= 15;
    }

    if (ip && /^10\.|^192\.168\./.test(ip)) {
      factors.push('IP locale (test)');
    }

    const level = this.scoreToLevel(score);
    return {
      score: Math.max(0, Math.min(100, score)),
      level,
      factors,
      allowed: cod.allowed && level !== 'high',
      phone: normalized,
    };
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }
}
