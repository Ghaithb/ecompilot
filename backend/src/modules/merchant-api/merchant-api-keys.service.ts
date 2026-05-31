import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { MerchantApiKey, MerchantApiKeyDocument } from './schemas/merchant-api-key.schema';

@Injectable()
export class MerchantApiKeysService {
  constructor(
    @InjectModel(MerchantApiKey.name)
    private keyModel: Model<MerchantApiKeyDocument>,
  ) {}

  private hashKey(raw: string) {
    return createHash('sha256').update(raw).digest('hex');
  }

  async list(tenantId: string) {
    const keys = await this.keyModel
      .find({ tenantId: new Types.ObjectId(tenantId), revokedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .lean();

    return keys.map((k) => ({
      id: k._id.toString(),
      name: k.name,
      keyPrefix: k.keyPrefix,
      createdAt: k.createdAt,
    }));
  }

  async create(tenantId: string, name: string) {
    const raw = `ecp_${randomBytes(24).toString('hex')}`;
    const doc = await this.keyModel.create({
      tenantId: new Types.ObjectId(tenantId),
      name: name.trim() || 'Clé API',
      keyPrefix: raw.slice(0, 12),
      keyHash: this.hashKey(raw),
    });

    return {
      id: doc._id.toString(),
      name: doc.name,
      keyPrefix: doc.keyPrefix,
      key: raw,
      createdAt: doc.createdAt,
    };
  }

  async revoke(tenantId: string, keyId: string) {
    const doc = await this.keyModel.findOneAndUpdate(
      { _id: keyId, tenantId: new Types.ObjectId(tenantId), revokedAt: { $exists: false } },
      { revokedAt: new Date() },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Clé API introuvable');
    return { revoked: true, id: keyId };
  }

  async validateKey(rawKey: string): Promise<string | null> {
    if (!rawKey?.startsWith('ecp_')) return null;
    const hash = this.hashKey(rawKey);
    const doc = await this.keyModel.findOne({ keyHash: hash, revokedAt: { $exists: false } });
    return doc ? doc.tenantId.toString() : null;
  }
}
