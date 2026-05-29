import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AdAccount, AdAccountDocument } from './schemas/ad-account.schema';
import { AdCampaign, AdCampaignDocument } from './schemas/ad-campaign.schema';
import crypto from 'crypto';

@Injectable()
export class GoogleAdsService {
  private readonly logger = new Logger(GoogleAdsService.name);

  constructor(
    @InjectModel(AdAccount.name) private adAccountModel: Model<AdAccountDocument>,
    @InjectModel(AdCampaign.name) private adCampaignModel: Model<AdCampaignDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Générer l'URL d'autorisation OAuth Google Ads
   */
  async authorize(tenantId: string) {
    const clientId = this.configService.get<string>('GOOGLE_ADS_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_ADS_REDIRECT_URI');
    const scopes = 'https://www.googleapis.com/auth/adwords';

    if (!clientId || !redirectUri) {
      this.logger.warn('Google Ads credentials not configured');
      return { mode: 'simulation', message: 'Google Ads OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&access_type=offline&prompt=consent`;

    this.logger.log(`Google Ads authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gérer le callback OAuth
   */
  async handleCallback(tenantId: string, code: string) {
    const clientId = this.configService.get<string>('GOOGLE_ADS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_ADS_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_ADS_REDIRECT_URI');

    if (!clientId || !clientSecret) {
      this.logger.warn('Google Ads credentials not configured, using simulation');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange Google Ads code for token');
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 3600;

      // Récupérer les comptes Google Ads
      const accountsRes = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': this.configService.get<string>('GOOGLE_ADS_DEVELOPER_TOKEN') || '',
        },
      });

      const accountsData: any = await accountsRes.json();
      const accountId = accountsData.resourceNames?.[0]?.split('/')?.[1] || 'demo-account';

      // Chiffrer les tokens
      const tokensKey = this.configService.get<string>('ADS_TOKENS_KEY');
      const accessTokenEnc = this.encryptToken(tokensKey, accessToken);
      const refreshTokenEnc = this.encryptToken(tokensKey, refreshToken);

      // Sauvegarder le compte
      await this.adAccountModel.findOneAndUpdate(
        { tenantId, platform: 'google_ads', accountId },
        {
          $set: {
            accountName: `Google Ads Account ${accountId}`,
            accessTokenEnc,
            refreshTokenEnc,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
            status: 'active',
            updatedAt: new Date(),
          },
          $setOnInsert: { tenantId, platform: 'google_ads', accountId, createdAt: new Date() },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`Google Ads connected for tenant ${tenantId}, account: ${accountId}`);
      return { success: true, accountId };
    } catch (error: any) {
      this.logger.error(`Google Ads callback error: ${error.message}`);
      throw new BadRequestException(`Google Ads connection failed: ${error.message}`);
    }
  }

  /**
   * Synchroniser les campagnes
   */
  async syncCampaigns(tenantId: string, accountId: string) {
    const account = await this.adAccountModel.findOne({ tenantId, accountId, platform: 'google_ads' }).exec();
    if (!account) {
      throw new BadRequestException('Google Ads account not found');
    }

    const accessToken = this.decryptToken(
      this.configService.get<string>('ADS_TOKENS_KEY'),
      account.accessTokenEnc,
    );

    if (!accessToken) {
      throw new BadRequestException('Failed to decrypt access token');
    }

    try {
      // Récupérer les campagnes via Google Ads API
      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc
        FROM campaign
        WHERE segments.date DURING LAST_30_DAYS
      `;

      const response = await fetch(
        `https://googleads.googleapis.com/v14/customers/${accountId}/googleAds:searchStream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': this.configService.get<string>('GOOGLE_ADS_DEVELOPER_TOKEN') || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        },
      );

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.status}`);
      }

      const data: any = await response.json();
      const campaigns = data.results || [];

      // Sauvegarder les campagnes
      for (const result of campaigns) {
        const campaign = result.campaign;
        const metrics = result.metrics;

        await this.adCampaignModel.findOneAndUpdate(
          { tenantId, platform: 'google_ads', campaignId: campaign.id.toString() },
          {
            $set: {
              campaignName: campaign.name,
              accountId,
              status: campaign.status.toLowerCase(),
              metrics: {
                impressions: parseInt(metrics.impressions || '0'),
                clicks: parseInt(metrics.clicks || '0'),
                conversions: parseFloat(metrics.conversions || '0'),
                spend: parseInt(metrics.cost_micros || '0') / 1000000,
                ctr: parseFloat(metrics.ctr || '0'),
                cpc: parseInt(metrics.average_cpc || '0') / 1000000,
              },
              lastSyncAt: new Date(),
              updatedAt: new Date(),
            },
            $setOnInsert: { tenantId, platform: 'google_ads', campaignId: campaign.id.toString(), createdAt: new Date() },
          },
          { upsert: true },
        );
      }

      // Mettre à jour la date de sync du compte
      account.lastSyncAt = new Date();
      await account.save();

      this.logger.log(`Synced ${campaigns.length} Google Ads campaigns for tenant ${tenantId}`);
      return { success: true, campaignsCount: campaigns.length };
    } catch (error: any) {
      this.logger.error(`Google Ads sync error: ${error.message}`);
      throw new BadRequestException(`Failed to sync Google Ads campaigns: ${error.message}`);
    }
  }

  /**
   * Récupérer les campagnes
   */
  async getCampaigns(tenantId: string, accountId?: string) {
    const query: any = { tenantId, platform: 'google_ads' };
    if (accountId) {
      query.accountId = accountId;
    }

    return this.adCampaignModel.find(query).sort({ lastSyncAt: -1 }).exec();
  }

  /**
   * Déconnecter un compte
   */
  async disconnect(tenantId: string, accountId: string) {
    await this.adAccountModel.deleteOne({ tenantId, accountId, platform: 'google_ads' }).exec();
    await this.adCampaignModel.deleteMany({ tenantId, accountId, platform: 'google_ads' }).exec();
    this.logger.log(`Google Ads account ${accountId} disconnected for tenant ${tenantId}`);
    return { success: true };
  }

  /**
   * Simulation de connexion
   */
  private async simulateConnection(tenantId: string) {
    await this.adAccountModel.findOneAndUpdate(
      { tenantId, platform: 'google_ads', accountId: 'demo-google-ads' },
      {
        $set: {
          accountName: 'Demo Google Ads Account',
          accessTokenEnc: 'demo-token',
          status: 'active',
          updatedAt: new Date(),
        },
        $setOnInsert: { tenantId, platform: 'google_ads', accountId: 'demo-google-ads', createdAt: new Date() },
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
