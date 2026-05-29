import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AdAccount, AdAccountDocument } from './schemas/ad-account.schema';
import { AdCampaign, AdCampaignDocument } from './schemas/ad-campaign.schema';
import crypto from 'crypto';

@Injectable()
export class TikTokAdsService {
  private readonly logger = new Logger(TikTokAdsService.name);

  constructor(
    @InjectModel(AdAccount.name) private adAccountModel: Model<AdAccountDocument>,
    @InjectModel(AdCampaign.name) private adCampaignModel: Model<AdCampaignDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Générer l'URL d'autorisation OAuth TikTok
   */
  async authorize(tenantId: string) {
    const appId = this.configService.get<string>('TIKTOK_APP_ID');
    const redirectUri = this.configService.get<string>('TIKTOK_ADS_REDIRECT_URI');

    if (!appId || !redirectUri) {
      this.logger.warn('TikTok Ads credentials not configured');
      return { mode: 'simulation', message: 'TikTok Ads OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const redirectUrl = `https://business-api.tiktok.com/portal/auth?app_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    this.logger.log(`TikTok Ads authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gérer le callback OAuth
   */
  async handleCallback(tenantId: string, authCode: string) {
    const appId = this.configService.get<string>('TIKTOK_APP_ID');
    const appSecret = this.configService.get<string>('TIKTOK_APP_SECRET');

    if (!appId || !appSecret) {
      this.logger.warn('TikTok Ads credentials not configured, using simulation');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const tokenRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          auth_code: authCode,
        }),
      });

      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange TikTok code for token');
      }

      const tokenData: any = await tokenRes.json();
      if (tokenData.code !== 0) {
        throw new BadRequestException(`TikTok API error: ${tokenData.message}`);
      }

      const accessToken = tokenData.data.access_token;
      const advertiserIds = tokenData.data.advertiser_ids || [];

      if (advertiserIds.length === 0) {
        throw new BadRequestException('No TikTok advertiser accounts found');
      }

      const accountId = advertiserIds[0];

      // Chiffrer le token
      const tokensKey = this.configService.get<string>('ADS_TOKENS_KEY');
      const accessTokenEnc = this.encryptToken(tokensKey, accessToken);

      // Sauvegarder le compte
      await this.adAccountModel.findOneAndUpdate(
        { tenantId, platform: 'tiktok_ads', accountId },
        {
          $set: {
            accountName: `TikTok Ads Account ${accountId}`,
            accessTokenEnc,
            status: 'active',
            updatedAt: new Date(),
          },
          $setOnInsert: { tenantId, platform: 'tiktok_ads', accountId, createdAt: new Date() },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`TikTok Ads connected for tenant ${tenantId}, account: ${accountId}`);
      return { success: true, accountId };
    } catch (error: any) {
      this.logger.error(`TikTok Ads callback error: ${error.message}`);
      throw new BadRequestException(`TikTok Ads connection failed: ${error.message}`);
    }
  }

  /**
   * Synchroniser les campagnes
   */
  async syncCampaigns(tenantId: string, accountId: string) {
    const account = await this.adAccountModel.findOne({ tenantId, accountId, platform: 'tiktok_ads' }).exec();
    if (!account) {
      throw new BadRequestException('TikTok Ads account not found');
    }

    const accessToken = this.decryptToken(
      this.configService.get<string>('ADS_TOKENS_KEY'),
      account.accessTokenEnc,
    );

    if (!accessToken) {
      throw new BadRequestException('Failed to decrypt access token');
    }

    try {
      // Récupérer les campagnes
      const campaignsRes = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${accountId}&access_token=${accessToken}`,
      );

      if (!campaignsRes.ok) {
        throw new Error(`TikTok Ads API error: ${campaignsRes.status}`);
      }

      const campaignsData: any = await campaignsRes.json();
      if (campaignsData.code !== 0) {
        throw new Error(`TikTok API error: ${campaignsData.message}`);
      }

      const campaigns = campaignsData.data?.list || [];

      // Pour chaque campagne, récupérer les métriques
      for (const campaign of campaigns) {
        const metricsRes = await fetch(
          `https://business-api.tiktok.com/open_api/v1.3/reports/integrated/get/?advertiser_id=${accountId}&service_type=AUCTION&report_type=BASIC&data_level=AUCTION_CAMPAIGN&dimensions=["campaign_id"]&metrics=["spend","impressions","clicks","ctr","cpc","conversions","cost_per_conversion"]&start_date=2024-01-01&end_date=2024-12-31&filtering=[{"field_name":"campaign_ids","filter_type":"IN","filter_value":"${campaign.campaign_id}"}]&access_token=${accessToken}`,
        );

        const metricsData: any = await metricsRes.json();
        const metrics = metricsData.data?.list?.[0]?.metrics || {};

        await this.adCampaignModel.findOneAndUpdate(
          { tenantId, platform: 'tiktok_ads', campaignId: campaign.campaign_id },
          {
            $set: {
              campaignName: campaign.campaign_name,
              accountId,
              status: campaign.operation_status.toLowerCase(),
              metrics: {
                impressions: parseInt(metrics.impressions || '0'),
                clicks: parseInt(metrics.clicks || '0'),
                conversions: parseFloat(metrics.conversions || '0'),
                spend: parseFloat(metrics.spend || '0'),
                ctr: parseFloat(metrics.ctr || '0'),
                cpc: parseFloat(metrics.cpc || '0'),
                cpa: parseFloat(metrics.cost_per_conversion || '0'),
              },
              lastSyncAt: new Date(),
              updatedAt: new Date(),
            },
            $setOnInsert: { tenantId, platform: 'tiktok_ads', campaignId: campaign.campaign_id, createdAt: new Date() },
          },
          { upsert: true },
        );
      }

      // Mettre à jour la date de sync du compte
      account.lastSyncAt = new Date();
      await account.save();

      this.logger.log(`Synced ${campaigns.length} TikTok Ads campaigns for tenant ${tenantId}`);
      return { success: true, campaignsCount: campaigns.length };
    } catch (error: any) {
      this.logger.error(`TikTok Ads sync error: ${error.message}`);
      throw new BadRequestException(`Failed to sync TikTok Ads campaigns: ${error.message}`);
    }
  }

  /**
   * Récupérer les campagnes
   */
  async getCampaigns(tenantId: string, accountId?: string) {
    const query: any = { tenantId, platform: 'tiktok_ads' };
    if (accountId) {
      query.accountId = accountId;
    }

    return this.adCampaignModel.find(query).sort({ lastSyncAt: -1 }).exec();
  }

  /**
   * Déconnecter un compte
   */
  async disconnect(tenantId: string, accountId: string) {
    await this.adAccountModel.deleteOne({ tenantId, accountId, platform: 'tiktok_ads' }).exec();
    await this.adCampaignModel.deleteMany({ tenantId, accountId, platform: 'tiktok_ads' }).exec();
    this.logger.log(`TikTok Ads account ${accountId} disconnected for tenant ${tenantId}`);
    return { success: true };
  }

  /**
   * Simulation de connexion
   */
  private async simulateConnection(tenantId: string) {
    await this.adAccountModel.findOneAndUpdate(
      { tenantId, platform: 'tiktok_ads', accountId: 'demo-tiktok-ads' },
      {
        $set: {
          accountName: 'Demo TikTok Ads Account',
          accessTokenEnc: 'demo-token',
          status: 'active',
          updatedAt: new Date(),
        },
        $setOnInsert: { tenantId, platform: 'tiktok_ads', accountId: 'demo-tiktok-ads', createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  /**
   * Chiffrer un token
   */
  private encryptToken(key: string | undefined, token: string | null): string | null {
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
   * Déchiffrer un token
   */
  private decryptToken(key: string | undefined, enc: string | null): string | null {
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
}
