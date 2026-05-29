import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { decryptSecret, encryptSecret } from '../../../common/utils/secret-encryption.util';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import { ResolvedProviderConfig } from '../interfaces/provider-config.interface';
import {
  ProviderCredential,
  ProviderCredentialDocument,
} from '../schemas/provider-credential.schema';

const DEFAULT_API_URLS: Partial<Record<DeliveryProviderId, string>> = {
  [DeliveryProviderId.FIRST_DELIVERY]: 'https://www.firstdeliverygroup.com/api/v2',
  [DeliveryProviderId.INTIGO]: '',
  [DeliveryProviderId.SHIPPER]: 'https://server.shipper.network/api/v1',
};

@Injectable()
export class DeliveryCredentialsService {
  private readonly logger = new Logger(DeliveryCredentialsService.name);

  constructor(
    @InjectModel(ProviderCredential.name) private credModel: Model<ProviderCredentialDocument>,
    private config: ConfigService,
  ) {}

  private masterKey(): string {
    return (
      this.config.get<string>('delivery.encryptionKey') ||
      this.config.get<string>('jwt.secret') ||
      'change-me-delivery-key'
    );
  }

  async saveCredential(
    tenantId: string,
    provider: DeliveryProviderId,
    token: string,
    options?: { label?: string; apiUrl?: string; extra?: Record<string, string> },
  ) {
    const { encrypted, iv } = encryptSecret(token, this.masterKey());
    await this.credModel.findOneAndUpdate(
      { tenantId: new Types.ObjectId(tenantId), provider },
      {
        encryptedToken: encrypted,
        iv,
        isActive: true,
        label: options?.label,
        apiUrl: options?.apiUrl,
        extra: options?.extra,
      },
      { upsert: true, new: true },
    );
    this.logger.log(`Credential ${provider} enregistré pour tenant ${tenantId}`);
  }

  /** @deprecated Utiliser saveCredential */
  async saveToken(tenantId: string, provider: DeliveryProviderId, token: string, label?: string) {
    return this.saveCredential(tenantId, provider, token, { label });
  }

  async getToken(tenantId: string, provider: DeliveryProviderId): Promise<string | null> {
    const doc = await this.credModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      provider,
      isActive: true,
    });
    if (!doc) return null;
    try {
      return decryptSecret(doc.encryptedToken, doc.iv, this.masterKey());
    } catch {
      this.logger.error(`Décryptage échoué pour ${provider}`);
      return null;
    }
  }

  async resolveProviderConfig(
    tenantId: string,
    provider: DeliveryProviderId,
    platformConfigKey: string,
  ): Promise<ResolvedProviderConfig> {
    const doc = await this.credModel
      .findOne({ tenantId: new Types.ObjectId(tenantId), provider, isActive: true })
      .lean();

    const platform = this.config.get<{
      apiUrl?: string;
      apiKey?: string;
      paths?: Record<string, string>;
    }>(platformConfigKey);

    const tenantToken = doc ? await this.getToken(tenantId, provider) : null;
    const platformKey = platform?.apiKey?.trim() || '';
    const apiKey = tenantToken || platformKey;

    const apiUrl =
      doc?.apiUrl?.trim() ||
      platform?.apiUrl?.trim() ||
      DEFAULT_API_URLS[provider] ||
      '';

    const extra: Record<string, string> = { ...(doc?.extra || {}) };
    if (platform?.paths) {
      if (platform.paths.create) extra.pathCreate = platform.paths.create;
      if (platform.paths.track) extra.pathTrack = platform.paths.track;
      if (platform.paths.cancel) extra.pathCancel = platform.paths.cancel;
      if (platform.paths.rates) extra.pathRates = platform.paths.rates;
    }

    const allowMock = this.config.get<boolean>('delivery.allowMock') === true;
    const mock = !apiKey && allowMock;

    let source: ResolvedProviderConfig['source'] = 'none';
    if (tenantToken) source = 'tenant';
    else if (platformKey) source = 'platform';

    return {
      provider,
      apiUrl,
      apiKey,
      mock,
      source,
      extra: Object.keys(extra).length ? extra : undefined,
    };
  }

  async listForTenant(tenantId: string) {
    const docs = await this.credModel.find({ tenantId: new Types.ObjectId(tenantId) }).lean();
    return docs.map((d) => ({
      provider: d.provider,
      isActive: d.isActive,
      label: d.label,
      hasToken: Boolean(d.encryptedToken),
      apiUrl: d.apiUrl || null,
    }));
  }
}
