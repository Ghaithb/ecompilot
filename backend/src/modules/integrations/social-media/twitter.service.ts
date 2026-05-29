import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { ConfigService } from '@nestjs/config';
import { SocialMediaService } from './social-media.service';
import crypto from 'crypto';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly configService: ConfigService,
    private readonly socialMediaService: SocialMediaService,
  ) {}

  /**
   * Génère l'URL d'autorisation Twitter OAuth 2.0
   */
  async authorize(tenantId: string) {
    const clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    const redirectUri = this.configService.get<string>('TWITTER_REDIRECT_URI');
    const scopes = this.configService.get<string>('TWITTER_SCOPES') || 'tweet.read tweet.write users.read';

    if (!clientId || !redirectUri) {
      this.logger.warn('Twitter credentials not configured, using simulation mode');
      return { mode: 'simulation', message: 'Twitter OAuth not configured' };
    }

    const state = Buffer.from(`${tenantId}:${Date.now()}`).toString('base64url');
    const codeChallenge = this.generateCodeChallenge();
    
    // Stocker le code_verifier temporairement (dans un cache Redis en production)
    const redirectUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    this.logger.log(`Twitter authorize URL generated for tenant=${tenantId}`);
    return { redirectUrl };
  }

  /**
   * Gère le callback OAuth de Twitter
   */
  async handleCallback(tenantId: string, code: string) {
    const clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    const clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('TWITTER_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.warn('Twitter credentials not configured, using simulation mode');
      await this.simulateConnection(tenantId);
      return { success: true, mode: 'simulation' };
    }

    try {
      // Échange du code contre un access token
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const formData = new URLSearchParams();
      formData.append('code', code);
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', redirectUri);
      formData.append('code_verifier', 'challenge'); // À remplacer par le vrai code_verifier

      const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!tokenRes.ok) {
        throw new BadRequestException('Failed to exchange Twitter code for token');
      }

      const tokenData: any = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 7200;

      // Récupérer les informations de l'utilisateur
      const userRes = await fetch('https://api.twitter.com/2/users/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const userData: any = await userRes.json();
      const user = userData.data;

      // Chiffrer les tokens
      const tokensKey = this.configService.get<string>('SOCIAL_TOKENS_KEY');
      const accessTokenEnc = this.socialMediaService.encryptToken(tokensKey, accessToken);
      const refreshTokenEnc = this.socialMediaService.encryptToken(tokensKey, refreshToken);

      // Sauvegarder dans la base de données
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        {
          $set: {
            'integrations.twitter.accountId': user.id,
            'integrations.twitter.username': user.username,
            'integrations.twitter.connectedAt': new Date(),
            'integrations.twitter.accessTokenEnc': accessTokenEnc,
            'integrations.twitter.refreshTokenEnc': refreshTokenEnc,
            'integrations.twitter.expiresAt': new Date(Date.now() + expiresIn * 1000),
            'integrations.twitter.scope': 'tweet.read tweet.write users.read',
            updatedAt: new Date(),
          },
        },
      );

      this.logger.log(`Twitter connected for tenant ${tenantId}, username: @${user.username}`);
      return { success: true, accountId: user.id, username: user.username };
    } catch (error: any) {
      this.logger.error(`Twitter callback error: ${error.message}`);
      throw new BadRequestException(`Twitter connection failed: ${error.message}`);
    }
  }

  /**
   * Simule une connexion Twitter (mode développement)
   */
  private async simulateConnection(tenantId: string) {
    await this.tenantModel.updateOne(
      { _id: new Types.ObjectId(tenantId) },
      {
        $set: {
          'integrations.twitter.accountId': 'demo-twitter-789',
          'integrations.twitter.username': 'demo_twitter',
          'integrations.twitter.connectedAt': new Date(),
          'integrations.twitter.scope': 'tweet.read tweet.write users.read',
          updatedAt: new Date(),
        },
      },
    );
  }

  /**
   * Publie un tweet
   */
  async publishTweet(tenantId: string, text: string, mediaIds?: string[]) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'twitter');

    if (!token) {
      throw new BadRequestException('Twitter not connected');
    }

    try {
      const body: any = { text };
      if (mediaIds && mediaIds.length > 0) {
        body.media = { media_ids: mediaIds };
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data: any = await response.json();

      // Mettre à jour lastSyncAt
      await this.tenantModel.updateOne(
        { _id: new Types.ObjectId(tenantId) },
        { $set: { 'integrations.twitter.lastSyncAt': new Date() } },
      );

      this.logger.log(`Tweet published for tenant ${tenantId}`);
      return { success: true, tweetId: data.data.id };
    } catch (error: any) {
      this.logger.error(`Twitter publish error: ${error.message}`);
      throw new BadRequestException(`Failed to publish tweet: ${error.message}`);
    }
  }

  /**
   * Récupère les statistiques du compte Twitter
   */
  async getUserMetrics(tenantId: string) {
    const token = await this.socialMediaService.getDecryptedToken(tenantId, 'twitter');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    const accountId = (tenant as any)?.integrations?.twitter?.accountId;

    if (!token || !accountId) {
      throw new BadRequestException('Twitter not connected');
    }

    try {
      const response = await fetch(
        `https://api.twitter.com/2/users/${accountId}?user.fields=public_metrics`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data: any = await response.json();
      return { success: true, metrics: data.data.public_metrics };
    } catch (error: any) {
      this.logger.error(`Twitter metrics error: ${error.message}`);
      throw new BadRequestException(`Failed to get Twitter metrics: ${error.message}`);
    }
  }

  /**
   * Génère un code challenge pour PKCE
   */
  private generateCodeChallenge(): string {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return challenge;
  }
}
