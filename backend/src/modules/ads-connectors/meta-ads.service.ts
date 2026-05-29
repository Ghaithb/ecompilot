import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AdAccount, AdAccountDocument } from './schemas/ad-account.schema';
import { AdCampaign, AdCampaignDocument } from './schemas/ad-campaign.schema';
import crypto from 'crypto';

@Injectable()
export class MetaAdsService {
  private readonly logger = new Logger(MetaAdsService.name);

  constructor(
    @InjectModel(AdAccount.name) private adAccountModel: Model<AdAccountDocument>,
    @InjectModel(AdCampaign.name) private adCampaignModel: Model<AdCampaignDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Générer l'URL d'autorisation OAuth Meta (Facebook)
   */
  async authorize(tenantId: string) {
    const appId = this.configService.get<string>('META_APP_ID');
    const redirectUri = this.configService.get<string>('META_ADS_REDIRECT_URI');
    const scopes = 'ads_read,ads_management,business_management';

    if (!appId || !redirectUri) {
      this.logger.warn('Meta Ads credentials not configured');
      return { mode: 'simulation', message: 'Meta Ads OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const redirectUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

    this.logger.log(`Meta Ads authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gérer le callback OAuth
   */
  async handleCallback(tenantId: string, code: string) {
    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    const redirectUri = this.configService.get<string>('META_ADS_REDIRECT_URI');

    if (!appId || !appSecret) {
      this.logger.warn('Meta Ads credentials not configured, using simulation');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
      const tokenRes = await fetch(tokenUrl);

      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange Meta code for token');
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Récupérer les comptes publicitaires
      const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}`);
      const accountsData: any = await accountsRes.json();

      const account = accountsData.data?.[0];
      if (!account) {
        throw new BadRequestException('No Meta ad accounts found');
      }

      const accountId = account.id;
      const accountName = account.name || `Meta Ad Account ${accountId}`;

      // Chiffrer le token
      const tokensKey = this.configService.get<string>('ADS_TOKENS_KEY');
      const accessTokenEnc = this.encryptToken(tokensKey, accessToken);

      // Sauvegarder le compte
      await this.adAccountModel.findOneAndUpdate(
        { tenantId, platform: 'meta_ads', accountId },
        {
          $set: {
            accountName,
            accessTokenEnc,
            status: 'active',
            updatedAt: new Date(),
          },
          $setOnInsert: { tenantId, platform: 'meta_ads', accountId, createdAt: new Date() },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`Meta Ads connected for tenant ${tenantId}, account: ${accountId}`);
      return { success: true, accountId, accountName };
    } catch (error: any) {
      this.logger.error(`Meta Ads callback error: ${error.message}`);
      throw new BadRequestException(`Meta Ads connection failed: ${error.message}`);
    }
  }

  /**
   * Synchroniser les campagnes
   */
  async syncCampaigns(tenantId: string, accountId: string) {
    const account = await this.adAccountModel.findOne({ tenantId, accountId, platform: 'meta_ads' }).exec();
    if (!account) {
      throw new BadRequestException('Meta Ads account not found');
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
      const fields = 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time';
      const campaignsRes = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=${fields}&access_token=${accessToken}`,
      );

      if (!campaignsRes.ok) {
        throw new Error(`Meta Ads API error: ${campaignsRes.status}`);
      }

      const campaignsData: any = await campaignsRes.json();
      const campaigns = campaignsData.data || [];

      // Pour chaque campagne, récupérer les insights
      for (const campaign of campaigns) {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v18.0/${campaign.id}/insights?fields=impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,conversions&access_token=${accessToken}`,
        );

        const insightsData: any = await insightsRes.json();
        const insights = insightsData.data?.[0] || {};

        await this.adCampaignModel.findOneAndUpdate(
          { tenantId, platform: 'meta_ads', campaignId: campaign.id },
          {
            $set: {
              campaignName: campaign.name,
              accountId,
              status: campaign.status.toLowerCase(),
              metrics: {
                impressions: parseInt(insights.impressions || '0'),
                clicks: parseInt(insights.clicks || '0'),
                conversions: parseFloat(insights.conversions || '0'),
                spend: parseFloat(insights.spend || '0'),
                ctr: parseFloat(insights.ctr || '0'),
                cpc: parseFloat(insights.cpc || '0'),
                reach: parseInt(insights.reach || '0'),
                frequency: parseFloat(insights.frequency || '0'),
              },
              startDate: campaign.start_time ? new Date(campaign.start_time) : undefined,
              endDate: campaign.stop_time ? new Date(campaign.stop_time) : undefined,
              lastSyncAt: new Date(),
              updatedAt: new Date(),
            },
            $setOnInsert: { tenantId, platform: 'meta_ads', campaignId: campaign.id, createdAt: new Date() },
          },
          { upsert: true },
        );
      }

      // Mettre à jour la date de sync du compte
      account.lastSyncAt = new Date();
      await account.save();

      this.logger.log(`Synced ${campaigns.length} Meta Ads campaigns for tenant ${tenantId}`);
      return { success: true, campaignsCount: campaigns.length };
    } catch (error: any) {
      this.logger.error(`Meta Ads sync error: ${error.message}`);
      throw new BadRequestException(`Failed to sync Meta Ads campaigns: ${error.message}`);
    }
  }

  /**
   * Récupérer les campagnes
   */
  async getCampaigns(tenantId: string, accountId?: string) {
    const query: any = { tenantId, platform: 'meta_ads' };
    if (accountId) {
      query.accountId = accountId;
    }

    return this.adCampaignModel.find(query).sort({ lastSyncAt: -1 }).exec();
  }

  /**
   * Déconnecter un compte
   */
  async disconnect(tenantId: string, accountId: string) {
    await this.adAccountModel.deleteOne({ tenantId, accountId, platform: 'meta_ads' }).exec();
    await this.adCampaignModel.deleteMany({ tenantId, accountId, platform: 'meta_ads' }).exec();
    this.logger.log(`Meta Ads account ${accountId} disconnected for tenant ${tenantId}`);
    return { success: true };
  }

  /**
   * Simulation de connexion
   */
  private async simulateConnection(tenantId: string) {
    await this.adAccountModel.findOneAndUpdate(
      { tenantId, platform: 'meta_ads', accountId: 'demo-meta-ads' },
      {
        $set: {
          accountName: 'Demo Meta Ads Account',
          accessTokenEnc: 'demo-token',
          status: 'active',
          updatedAt: new Date(),
        },
        $setOnInsert: { tenantId, platform: 'meta_ads', accountId: 'demo-meta-ads', createdAt: new Date() },
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
