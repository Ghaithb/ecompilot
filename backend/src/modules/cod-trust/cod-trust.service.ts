import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PhoneBlacklist, PhoneBlacklistDocument } from './schemas/phone-blacklist.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { isValidTunisianPhone, normalizeTunisianPhone } from '../../common/utils/phone.util';

export type CodTrustLevel = 'trusted' | 'normal' | 'suspect' | 'blocked';

export interface CodTrustResult {
  allowed: boolean;
  score: number;
  level: CodTrustLevel;
  reason?: string;
}

@Injectable()
export class CodTrustService {
  private readonly logger = new Logger(CodTrustService.name);

  constructor(
    @InjectModel(PhoneBlacklist.name) private blacklistModel: Model<PhoneBlacklistDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  validatePhone(phone: string): boolean {
    return isValidTunisianPhone(phone);
  }

  normalizePhone(phone: string): string {
    return normalizeTunisianPhone(phone);
  }

  async isBlacklisted(tenantId: string, phone: string): Promise<boolean> {
    const normalized = this.normalizePhone(phone);
    const entry = await this.blacklistModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      phone: normalized,
    });
    return !!entry;
  }

  async getTrustScore(tenantId: string, phone: string): Promise<CodTrustResult> {
    const normalized = this.normalizePhone(phone);

    if (!this.validatePhone(normalized)) {
      return { allowed: false, score: 0, level: 'blocked', reason: 'Numéro de téléphone invalide' };
    }

    if (await this.isBlacklisted(tenantId, normalized)) {
      return { allowed: false, score: 0, level: 'blocked', reason: 'Numéro blacklisté' };
    }

    const customer = await this.customerModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      phone: normalized,
    });

    const codTrust = customer?.codTrust;
    if (codTrust?.level === 'blocked' || customer?.status === 'blocked') {
      return { allowed: false, score: codTrust?.score ?? 0, level: 'blocked', reason: 'Client bloqué' };
    }

    const score = codTrust?.score ?? this.computeScoreFromOrders(tenantId, normalized, customer);
    const level = this.scoreToLevel(score);

    if (level === 'blocked') {
      return { allowed: false, score, level, reason: 'Score COD trop faible' };
    }

    return { allowed: true, score, level };
  }

  async checkOrderAllowed(tenantId: string, phone: string): Promise<CodTrustResult> {
    return this.getTrustScore(tenantId, phone);
  }

  async recordVerifiedOrder(tenantId: string, phone: string, customerEmail?: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await this.updateCustomerTrust(tenantId, normalized, customerEmail, (trust) => ({
      verifiedOrders: (trust.verifiedOrders ?? 0) + 1,
      score: Math.min(100, (trust.score ?? 70) + 5),
      level: this.scoreToLevel(Math.min(100, (trust.score ?? 70) + 5)),
    }));
  }

  async recordCancelledOrder(tenantId: string, phone: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await this.updateCustomerTrust(tenantId, normalized, undefined, (trust) => {
      const score = Math.max(0, (trust.score ?? 70) - 15);
      return {
        cancelledOrders: (trust.cancelledOrders ?? 0) + 1,
        score,
        level: this.scoreToLevel(score),
      };
    });
  }

  async recordDeliveryRefusal(tenantId: string, phone: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await this.updateCustomerTrust(tenantId, normalized, undefined, (trust) => {
      const score = Math.max(0, (trust.score ?? 70) - 25);
      return {
        deliveryRefusals: (trust.deliveryRefusals ?? 0) + 1,
        score,
        level: this.scoreToLevel(score),
      };
    });
  }

  async addToBlacklist(tenantId: string, phone: string, reason?: string, addedBy?: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await this.blacklistModel.findOneAndUpdate(
      { tenantId: new Types.ObjectId(tenantId), phone: normalized },
      { reason, addedBy },
      { upsert: true },
    );
    await this.customerModel.updateOne(
      { tenantId: new Types.ObjectId(tenantId), phone: normalized },
      { $set: { status: 'blocked', 'codTrust.level': 'blocked', 'codTrust.score': 0 } },
    );
  }

  async removeFromBlacklist(tenantId: string, phone: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await this.blacklistModel.deleteOne({
      tenantId: new Types.ObjectId(tenantId),
      phone: normalized,
    });
  }

  async listBlacklist(tenantId: string) {
    return this.blacklistModel.find({ tenantId: new Types.ObjectId(tenantId) }).lean();
  }

  private scoreToLevel(score: number): CodTrustLevel {
    if (score >= 80) return 'trusted';
    if (score >= 50) return 'normal';
    if (score >= 25) return 'suspect';
    return 'blocked';
  }

  private computeScoreFromOrders(tenantId: string, phone: string, customer: CustomerDocument | null): number {
    let score = 70;
    if (customer?.codTrust) {
      score = customer.codTrust.score ?? 70;
    }
    return score;
  }

  private async updateCustomerTrust(
    tenantId: string,
    phone: string,
    email: string | undefined,
    updater: (trust: NonNullable<Customer['codTrust']>) => Partial<NonNullable<Customer['codTrust']>>,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      phone,
    };
    if (email) filter.email = email;

    let customer = await this.customerModel.findOne(filter);
    if (!customer && email) {
      customer = await this.customerModel.findOne({
        tenantId: new Types.ObjectId(tenantId),
        email,
      });
    }

    if (!customer) {
      this.logger.warn(`Client introuvable pour mise à jour trust: ${phone}`);
      return;
    }

    const current = customer.codTrust ?? {
      score: 70,
      level: 'normal' as CodTrustLevel,
      deliveryRefusals: 0,
      cancelledOrders: 0,
      verifiedOrders: 0,
    };

    customer.codTrust = { ...current, ...updater(current) };
    if (customer.codTrust.level === 'blocked') {
      customer.status = 'blocked';
    }
    await customer.save();
  }
}
