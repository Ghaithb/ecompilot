import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import { SocialMediaService } from './social-media.service';

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly configService: ConfigService,
    private readonly socialMediaService: SocialMediaService,
  ) {}

  /**
   * Génère l'URL d'autorisation LinkedIn OAuth 2.0
   */
  async authorize(tenantId: string) {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const redirectUri = this.configService.get<string>('LINKEDIN_REDIRECT_URI');
    const scopes = this.configService.get<string>('LINKEDIN_SCOPES') || 'w_member_social r_organization_social';

    if (!clientId || !redirectUri) {
      this.logger.warn('LinkedIn credentials not configured, using simulation mode');
      return { mode: 'simulation', message: 'LinkedIn OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;

    this.logger.log(`LinkedIn authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gère le callback OAuth de LinkedIn
   */
  async handleCallback(tenantId: string, code: string) {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('LINKEDIN_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.warn('LinkedIn credentials not configured, using simulation mode');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('redirect_uri', redirectUri);
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);

      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange LinkedIn code for token');
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 5184000; // 60 jours par défaut

      // Récupérer les informations de l'organisation
      const orgRes = await fetch('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&projection=(elements*(organization~(localizedName)))', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const orgData: any = await orgRes.json();
      const org = orgData.elements?.[0]?.['organization~'];

      // Chiffrer le token
      const tokensKey = this.configService.get<string>('SOCIAL_TOKENS_KEY');
      const accessTokenEnc = this.socialMediaService.encryptToken(tokensKey, accessToken);

      // Sauvegarder dans la base de données
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        {
          $set: {
            'integrations.linkedin.organizationId': org?.id || 'personal',
            'integrations.linkedin.organizationName': org?.localizedName || 'Personal Profile',
            'integrations.linkedin.connectedAt': new Date(),
            'integrations.linkedin.accessTokenEnc': accessTokenEnc,
            'integrations.linkedin.expiresAt': new Date(Date.now() + expiresIn * 1000),
            'integrations.linkedin.scope': 'w_member_social r_organization_social',
            updatedAt: new Date(),
          },
        },
      );

      this.logger.log(`LinkedIn connected for tenant ${tenantId}, org: ${org?.localizedName || 'Personal'}`);
      return { success: true, organizationId: org?.id, organizationName: org?.localizedName };
    } catch (error: any) {
      this.logger.error(`LinkedIn callback error: ${error.message}`);
      throw new BadRequestException(`LinkedIn connection failed: ${error.message}`);
    }
  }

  /**
   * Simule une connexion LinkedIn (mode développement)
   */
  private async simulateConnection(tenantId: string) {
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $set: {
          'integrations.linkedin.organizationId': 'demo-org-101',
          'integrations.linkedin.organizationName': 'Demo Company',
          'integrations.linkedin.connectedAt': new Date(),
          'integrations.linkedin.scope': 'w_member_social r_organization_social',
          updatedAt: new Date(),
        },
      },
    );
  }

  /**
   * Publie un post sur LinkedIn
   */
  async publishPost(tenantId: string, text: string, imageUrl?: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'linkedin');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const organizationId = (tenant as any)?.integrations?.linkedin?.organizationId;

    if (!token) {
      throw new BadRequestException('LinkedIn not connected');
    }

    try {
      // Récupérer l'URN de l'auteur
      const meRes = await fetch('https://api.linkedin.com/v2/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const meData: any = await meRes.json();
      const authorUrn = `urn:li:person:${meData.id}`;

      // Construire le payload
      const body: any = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      if (imageUrl) {
        body.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            originalUrl: imageUrl,
          },
        ];
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      const data: any = await response.json();

      // Mettre à jour lastSyncAt
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        { $set: { 'integrations.linkedin.lastSyncAt': new Date() } },
      );

      this.logger.log(`Post published to LinkedIn for tenant ${tenantId}`);
      return { success: true, postId: data.id };
    } catch (error: any) {
      this.logger.error(`LinkedIn publish error: ${error.message}`);
      throw new BadRequestException(`Failed to publish to LinkedIn: ${error.message}`);
    }
  }

  /**
   * Récupère les statistiques de l'organisation LinkedIn
   */
  async getOrganizationStatistics(tenantId: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'linkedin');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const organizationId = (tenant as any)?.integrations?.linkedin?.organizationId;

    if (!token || !organizationId || organizationId === 'personal') {
      throw new BadRequestException('LinkedIn organization not connected');
    }

    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      const data: any = await response.json();
      return { success: true, statistics: data.elements };
    } catch (error: any) {
      this.logger.error(`LinkedIn statistics error: ${error.message}`);
      throw new BadRequestException(`Failed to get LinkedIn statistics: ${error.message}`);
    }
  }
}
