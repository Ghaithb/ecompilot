import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import { SocialMediaService } from './social-media.service';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly configService: ConfigService,
    private readonly socialMediaService: SocialMediaService,
  ) {}

  /**
   * Génère l'URL d'autorisation Instagram (via Facebook)
   */
  async authorize(tenantId: string) {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const redirectUri = this.configService.get<string>('INSTAGRAM_REDIRECT_URI');
    const scopes = this.configService.get<string>('INSTAGRAM_SCOPES') || 'instagram_basic,instagram_content_publish';

    if (!appId || !redirectUri) {
      this.logger.warn('Instagram credentials not configured, using simulation mode');
      return { mode: 'simulation', message: 'Instagram OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const redirectUrl = `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${encodeURIComponent(state)}`;

    this.logger.log(`Instagram authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gère le callback OAuth d'Instagram
   */
  async handleCallback(tenantId: string, code: string) {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    const redirectUri = this.configService.get<string>('INSTAGRAM_REDIRECT_URI');

    if (!appId || !appSecret || !redirectUri) {
      this.logger.warn('Instagram credentials not configured, using simulation mode');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const formData = new URLSearchParams();
      formData.append('client_id', appId);
      formData.append('client_secret', appSecret);
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', redirectUri);
      formData.append('code', code);

      const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        body: formData,
      });

      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange Instagram code for token');
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const userId = tokenData.user_id;

      // Récupérer les informations du compte
      const userRes = await fetch(`https://graph.instagram.com/${userId}?fields=id,username&access_token=${accessToken}`);
      const userData: any = await userRes.json();

      // Chiffrer le token
      const tokensKey = this.configService.get<string>('SOCIAL_TOKENS_KEY');
      const accessTokenEnc = this.socialMediaService.encryptToken(tokensKey, accessToken);

      // Sauvegarder dans la base de données
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        {
          $set: {
            'integrations.instagram.accountId': userId,
            'integrations.instagram.username': userData.username,
            'integrations.instagram.connectedAt': new Date(),
            'integrations.instagram.accessTokenEnc': accessTokenEnc,
            'integrations.instagram.expiresAt': new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
            'integrations.instagram.scope': 'instagram_basic,instagram_content_publish',
            updatedAt: new Date(),
          },
        },
      );

      this.logger.log(`Instagram connected for tenant ${tenantId}, username: ${userData.username}`);
      return { success: true, accountId: userId, username: userData.username };
    } catch (error: any) {
      this.logger.error(`Instagram callback error: ${error.message}`);
      throw new BadRequestException(`Instagram connection failed: ${error.message}`);
    }
  }

  /**
   * Simule une connexion Instagram (mode développement)
   */
  private async simulateConnection(tenantId: string) {
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $set: {
          'integrations.instagram.accountId': 'demo-account-456',
          'integrations.instagram.username': 'demo_instagram',
          'integrations.instagram.connectedAt': new Date(),
          'integrations.instagram.scope': 'instagram_basic,instagram_content_publish',
          updatedAt: new Date(),
        },
      },
    );
  }

  /**
   * Publie une photo sur Instagram
   */
  async publishPhoto(tenantId: string, imageUrl: string, caption?: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'instagram');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const accountId = (tenant as any)?.integrations?.instagram?.accountId;

    if (!token || !accountId) {
      throw new BadRequestException('Instagram not connected');
    }

    try {
      // Étape 1: Créer un conteneur média
      const containerRes = await fetch(
        `https://graph.instagram.com/${accountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption || '',
            access_token: token,
          }),
        }
      );

      if (!containerRes.ok) {
        throw new Error(`Instagram API error: ${containerRes.status}`);
      }

      const containerData: any = await containerRes.json();
      const creationId = containerData.id;

      // Étape 2: Publier le conteneur
      const publishRes = await fetch(
        `https://graph.instagram.com/${accountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: token,
          }),
        }
      );

      if (!publishRes.ok) {
        throw new Error(`Instagram publish error: ${publishRes.status}`);
      }

      const publishData: any = await publishRes.json();

      // Mettre à jour lastSyncAt
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        { $set: { 'integrations.instagram.lastSyncAt': new Date() } },
      );

      this.logger.log(`Photo published to Instagram for tenant ${tenantId}`);
      return { success: true, mediaId: publishData.id };
    } catch (error: any) {
      this.logger.error(`Instagram publish error: ${error.message}`);
      throw new BadRequestException(`Failed to publish to Instagram: ${error.message}`);
    }
  }

  /**
   * Récupère les statistiques du compte Instagram
   */
  async getAccountInsights(tenantId: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'instagram');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const accountId = (tenant as any)?.integrations?.instagram?.accountId;

    if (!token || !accountId) {
      throw new BadRequestException('Instagram not connected');
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/${accountId}/insights?metric=impressions,reach,follower_count&period=day&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data: any = await response.json();
      return { success: true, insights: data.data };
    } catch (error: any) {
      this.logger.error(`Instagram insights error: ${error.message}`);
      throw new BadRequestException(`Failed to get Instagram insights: ${error.message}`);
    }
  }
}
