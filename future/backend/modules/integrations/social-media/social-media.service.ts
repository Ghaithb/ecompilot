import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Chiffre un token avec AES-256-GCM
   */
  encryptToken(key: string | undefined, token: string | null): string | null {
    if (!key || !token) return null;
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'utf8').subarray(0, 32), iv);
      const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();
      return Buffer.concat([iv, tag, ciphertext]).toString('base64');
    } catch (error: any) {
      this.logger.error(`Token encryption error: ${error.message}`);
      return null;
    }
  }

  /**
   * Déchiffre un token avec AES-256-GCM
   */
  decryptToken(key: string | undefined, enc: string | null): string | null {
    if (!key || !enc) return null;
    try {
      const buf = Buffer.from(enc, 'base64');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const ciphertext = buf.subarray(28);
      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'utf8').subarray(0, 32), iv);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return plain.toString('utf8');
    } catch (error: any) {
      this.logger.error(`Token decryption error: ${error.message}`);
      return null;
    }
  }

  /**
   * Récupère le token déchiffré pour un tenant et une plateforme
   */
  async getDecryptedToken(tenantId: string, platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'): Promise<string | null> {
    const tokensKey = this.configService.get<string>('SOCIAL_TOKENS_KEY');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const enc = (tenant as any)?.integrations?.[platform]?.accessTokenEnc as string | undefined;
    return this.decryptToken(tokensKey, enc || null);
  }

  /**
   * Récupère le statut de toutes les intégrations sociales pour un tenant
   */
  async getSocialStatus(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const integrations = (tenant as any)?.integrations || {};

    return {
      facebook: {
        connected: !!integrations.facebook?.connectedAt,
        pageId: integrations.facebook?.pageId,
        pageName: integrations.facebook?.pageName,
        connectedAt: integrations.facebook?.connectedAt,
        lastSyncAt: integrations.facebook?.lastSyncAt,
        expiresAt: integrations.facebook?.expiresAt,
      },
      instagram: {
        connected: !!integrations.instagram?.connectedAt,
        accountId: integrations.instagram?.accountId,
        username: integrations.instagram?.username,
        connectedAt: integrations.instagram?.connectedAt,
        lastSyncAt: integrations.instagram?.lastSyncAt,
        expiresAt: integrations.instagram?.expiresAt,
      },
      twitter: {
        connected: !!integrations.twitter?.connectedAt,
        accountId: integrations.twitter?.accountId,
        username: integrations.twitter?.username,
        connectedAt: integrations.twitter?.connectedAt,
        lastSyncAt: integrations.twitter?.lastSyncAt,
        expiresAt: integrations.twitter?.expiresAt,
      },
      linkedin: {
        connected: !!integrations.linkedin?.connectedAt,
        organizationId: integrations.linkedin?.organizationId,
        organizationName: integrations.linkedin?.organizationName,
        connectedAt: integrations.linkedin?.connectedAt,
        lastSyncAt: integrations.linkedin?.lastSyncAt,
        expiresAt: integrations.linkedin?.expiresAt,
      },
    };
  }

  /**
   * Déconnecte une plateforme sociale
   */
  async disconnect(tenantId: string, platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin') {
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $unset: {
          [`integrations.${platform}`]: '',
        },
        $set: { updatedAt: new Date() },
      },
    );
    this.logger.log(`${platform} disconnected for tenant ${tenantId}`);
    return { success: true, platform };
  }
}
