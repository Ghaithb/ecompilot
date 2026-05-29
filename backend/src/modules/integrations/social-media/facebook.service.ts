import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import { SocialMediaService } from './social-media.service';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly configService: ConfigService,
    private readonly socialMediaService: SocialMediaService,
  ) {}

  /**
   * Génère l'URL d'autorisation Facebook OAuth
   */
  async authorize(tenantId: string) {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const redirectUri = this.configService.get<string>('FACEBOOK_REDIRECT_URI');
    const scopes = this.configService.get<string>('FACEBOOK_SCOPES') || 'pages_manage_posts,pages_read_engagement,pages_show_list';

    if (!appId || !redirectUri) {
      this.logger.warn('Facebook credentials not configured, using simulation mode');
      return { mode: 'simulation', message: 'Facebook OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const redirectUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

    this.logger.log(`Facebook authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gère le callback OAuth de Facebook
   */
  async handleCallback(tenantId: string, code: string, state?: string) {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    const redirectUri = this.configService.get<string>('FACEBOOK_REDIRECT_URI');

    if (!appId || !appSecret || !redirectUri) {
      this.logger.warn('Facebook credentials not configured, using simulation mode');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
      const tokenRes = await fetch(tokenUrl);
      
      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange Facebook code for token');
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 5184000; // 60 jours par défaut

      // Récupérer les informations de la page
      const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
      const pagesData: any = await pagesRes.json();
      
      const page = pagesData.data?.[0]; // Prendre la première page
      if (!page) {
        throw new BadRequestException('No Facebook page found for this account');
      }

      // Chiffrer le token
      const tokensKey = this.configService.get<string>('SOCIAL_TOKENS_KEY');
      const accessTokenEnc = this.socialMediaService.encryptToken(tokensKey, page.access_token || accessToken);

      // Sauvegarder dans la base de données
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        {
          $set: {
            'integrations.facebook.pageId': page.id,
            'integrations.facebook.pageName': page.name,
            'integrations.facebook.connectedAt': new Date(),
            'integrations.facebook.accessTokenEnc': accessTokenEnc,
            'integrations.facebook.expiresAt': new Date(Date.now() + expiresIn * 1000),
            'integrations.facebook.scope': 'pages_manage_posts,pages_read_engagement',
            updatedAt: new Date(),
          },
        },
      );

      this.logger.log(`Facebook connected for tenant ${tenantId}, page: ${page.name}`);
      return { success: true, pageId: page.id, pageName: page.name };
    } catch (error: any) {
      this.logger.error(`Facebook callback error: ${error.message}`);
      throw new BadRequestException(`Facebook connection failed: ${error.message}`);
    }
  }

  /**
   * Simule une connexion Facebook (mode développement)
   */
  private async simulateConnection(tenantId: string) {
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $set: {
          'integrations.facebook.pageId': 'demo-page-123',
          'integrations.facebook.pageName': 'Demo Facebook Page',
          'integrations.facebook.connectedAt': new Date(),
          'integrations.facebook.scope': 'pages_manage_posts,pages_read_engagement',
          updatedAt: new Date(),
        },
      },
    );
  }

  /**
   * Publie un post sur Facebook
   */
  async publishPost(tenantId: string, message: string, imageUrl?: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'facebook');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const pageId = (tenant as any)?.integrations?.facebook?.pageId;

    if (!token || !pageId) {
      throw new BadRequestException('Facebook not connected');
    }

    try {
      const body: any = { message, access_token: token };
      if (imageUrl) {
        body.url = imageUrl;
      }

      const endpoint = imageUrl 
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      const data: any = await response.json();
      
      // Mettre à jour lastSyncAt
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        { $set: { 'integrations.facebook.lastSyncAt': new Date() } },
      );

      this.logger.log(`Post published to Facebook for tenant ${tenantId}`);
      return { success: true, postId: data.id || data.post_id };
    } catch (error: any) {
      this.logger.error(`Facebook publish error: ${error.message}`);
      throw new BadRequestException(`Failed to publish to Facebook: ${error.message}`);
    }
  }

  /**
   * Récupère les statistiques de la page Facebook
   */
  async getPageInsights(tenantId: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'facebook');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const pageId = (tenant as any)?.integrations?.facebook?.pageId;

    if (!token || !pageId) {
      throw new BadRequestException('Facebook not connected');
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_engaged_users,page_fans&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      const data: any = await response.json();
      return { success: true, insights: data.data };
    } catch (error: any) {
      this.logger.error(`Facebook insights error: ${error.message}`);
      throw new BadRequestException(`Failed to get Facebook insights: ${error.message}`);
    }
  }
}
