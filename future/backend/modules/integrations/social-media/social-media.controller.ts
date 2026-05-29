import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { SocialMediaService } from './social-media.service';
import { FacebookService } from './facebook.service';
import { InstagramService } from './instagram.service';
import { TwitterService } from './twitter.service';
import { LinkedinService } from './linkedin.service';
import { LinkedInAdsService } from './linkedin-ads.service';

@ApiTags('social-media')
@ApiBearerAuth()
@Controller('integrations/social')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SocialMediaController {
  constructor(
    private readonly socialMediaService: SocialMediaService,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
    private readonly twitterService: TwitterService,
    private readonly linkedinService: LinkedinService,
    private readonly linkedinAdsService: LinkedInAdsService,
  ) {}

  // ==================== FACEBOOK ====================

  @Get('facebook/authorize')
  @ApiOperation({ summary: 'Autoriser Facebook', description: 'Génère l\'URL d\'autorisation OAuth Facebook' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeFacebook(@TenantId() tenantId: string) {
    return this.facebookService.authorize(tenantId);
  }

  @Get('facebook/connect')
  @ApiOperation({ summary: 'Connecter Facebook', description: 'Gère le callback OAuth Facebook' })
  @ApiResponse({ status: 200, description: 'Facebook connecté' })
  async connectFacebook(@TenantId() tenantId: string, @Query('code') code: string, @Query('state') state?: string) {
    return this.facebookService.handleCallback(tenantId, code, state);
  }

  @Post('facebook/disconnect')
  @ApiOperation({ summary: 'Déconnecter Facebook', description: 'Déconnecte le compte Facebook' })
  @ApiResponse({ status: 200, description: 'Facebook déconnecté' })
  async disconnectFacebook(@TenantId() tenantId: string) {
    return this.socialMediaService.disconnect(tenantId, 'facebook');
  }

  @Post('facebook/publish')
  @ApiOperation({ summary: 'Publier sur Facebook', description: 'Publie un post sur la page Facebook' })
  @ApiResponse({ status: 200, description: 'Post publié' })
  async publishFacebook(
    @TenantId() tenantId: string,
    @Body() body: { message: string; imageUrl?: string },
  ) {
    return this.facebookService.publishPost(tenantId, body.message, body.imageUrl);
  }

  @Get('facebook/insights')
  @ApiOperation({ summary: 'Statistiques Facebook', description: 'Récupère les statistiques de la page Facebook' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getFacebookInsights(@TenantId() tenantId: string) {
    return this.facebookService.getPageInsights(tenantId);
  }

  // ==================== INSTAGRAM ====================

  @Get('instagram/authorize')
  @ApiOperation({ summary: 'Autoriser Instagram', description: 'Génère l\'URL d\'autorisation OAuth Instagram' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeInstagram(@TenantId() tenantId: string) {
    return this.instagramService.authorize(tenantId);
  }

  @Get('instagram/connect')
  @ApiOperation({ summary: 'Connecter Instagram', description: 'Gère le callback OAuth Instagram' })
  @ApiResponse({ status: 200, description: 'Instagram connecté' })
  async connectInstagram(@TenantId() tenantId: string, @Query('code') code: string) {
    return this.instagramService.handleCallback(tenantId, code);
  }

  @Post('instagram/disconnect')
  @ApiOperation({ summary: 'Déconnecter Instagram', description: 'Déconnecte le compte Instagram' })
  @ApiResponse({ status: 200, description: 'Instagram déconnecté' })
  async disconnectInstagram(@TenantId() tenantId: string) {
    return this.socialMediaService.disconnect(tenantId, 'instagram');
  }

  @Post('instagram/publish')
  @ApiOperation({ summary: 'Publier sur Instagram', description: 'Publie une photo sur Instagram' })
  @ApiResponse({ status: 200, description: 'Photo publiée' })
  async publishInstagram(
    @TenantId() tenantId: string,
    @Body() body: { imageUrl: string; caption?: string },
  ) {
    return this.instagramService.publishPhoto(tenantId, body.imageUrl, body.caption);
  }

    @Get('instagram/insights')
  @ApiOperation({ summary: 'Statistiques Instagram', description: 'Récupère les statistiques du compte Instagram' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getInstagramInsights(@TenantId() tenantId: string) {
    return this.instagramService.getAccountInsights(tenantId);
  }

  // ==================== TWITTER ====================

  // ==================== TWITTER ====================

  @Get('twitter/authorize')
  @ApiOperation({ summary: 'Autoriser Twitter', description: 'Génère l\'URL d\'autorisation OAuth Twitter' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeTwitter(@TenantId() tenantId: string) {
    return this.twitterService.authorize(tenantId);
  }

  @Get('twitter/connect')
  @ApiOperation({ summary: 'Connecter Twitter', description: 'Gère le callback OAuth Twitter' })
  @ApiResponse({ status: 200, description: 'Twitter connecté' })
  async connectTwitter(@TenantId() tenantId: string, @Query('code') code: string) {
    return this.twitterService.handleCallback(tenantId, code);
  }

  @Post('twitter/disconnect')
  @ApiOperation({ summary: 'Déconnecter Twitter', description: 'Déconnecte le compte Twitter' })
  @ApiResponse({ status: 200, description: 'Twitter déconnecté' })
  async disconnectTwitter(@TenantId() tenantId: string) {
    return this.socialMediaService.disconnect(tenantId, 'twitter');
  }

  @Post('twitter/publish')
  @ApiOperation({ summary: 'Publier sur Twitter', description: 'Publie un tweet' })
  @ApiResponse({ status: 200, description: 'Tweet publié' })
  async publishTwitter(
    @TenantId() tenantId: string,
    @Body() body: { text: string; mediaIds?: string[] },
  ) {
    return this.twitterService.publishTweet(tenantId, body.text, body.mediaIds);
  }

  @Get('twitter/metrics')
  @ApiOperation({ summary: 'Métriques Twitter', description: 'Récupère les métriques du compte Twitter' })
  @ApiResponse({ status: 200, description: 'Métriques récupérées' })
  async getTwitterMetrics(@TenantId() tenantId: string) {
    return this.twitterService.getUserMetrics(tenantId);
  }

  // ==================== LINKEDIN ====================

  @Get('linkedin/authorize')
  @ApiOperation({ summary: 'Autoriser LinkedIn', description: 'Génère l\'URL d\'autorisation OAuth LinkedIn' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeLinkedin(@TenantId() tenantId: string) {
    return this.linkedinService.authorize(tenantId);
  }

  @Get('linkedin/connect')
  @ApiOperation({ summary: 'Connecter LinkedIn', description: 'Gère le callback OAuth LinkedIn' })
  @ApiResponse({ status: 200, description: 'LinkedIn connecté' })
  async connectLinkedin(@TenantId() tenantId: string, @Query('code') code: string) {
    return this.linkedinService.handleCallback(tenantId, code);
  }

  @Post('linkedin/disconnect')
  @ApiOperation({ summary: 'Déconnecter LinkedIn', description: 'Déconnecte le compte LinkedIn' })
  @ApiResponse({ status: 200, description: 'LinkedIn déconnecté' })
  async disconnectLinkedin(@TenantId() tenantId: string) {
    return this.socialMediaService.disconnect(tenantId, 'linkedin');
  }

  @Post('linkedin/publish')
  @ApiOperation({ summary: 'Publier sur LinkedIn', description: 'Publie un post sur LinkedIn' })
  @ApiResponse({ status: 200, description: 'Post publié' })
  async publishLinkedin(
    @TenantId() tenantId: string,
    @Body() body: { text: string; imageUrl?: string },
  ) {
    return this.linkedinService.publishPost(tenantId, body.text, body.imageUrl);
  }

  @Get('linkedin/statistics')
  @ApiOperation({ summary: 'Statistiques LinkedIn', description: 'Récupère les statistiques de l\'organisation LinkedIn' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getLinkedinStatistics(@TenantId() tenantId: string) {
    return this.linkedinService.getOrganizationStatistics(tenantId);
  }

  // ==================== LINKEDIN ADS ====================

  @Get('linkedin/ad-accounts')
  @ApiOperation({ summary: 'Comptes Publicitaires LinkedIn', description: 'Récupère tous les comptes publicitaires LinkedIn' })
  @ApiResponse({ status: 200, description: 'Comptes publicitaires récupérés' })
  async getLinkedInAdAccounts(@TenantId() tenantId: string) {
    return this.linkedinAdsService.getAdAccounts(tenantId);
  }

  @Get('linkedin/campaigns')
  @ApiOperation({ summary: 'Campagnes LinkedIn Ads', description: 'Récupère toutes les campagnes LinkedIn' })
  @ApiResponse({ status: 200, description: 'Campagnes récupérées' })
  async getLinkedInCampaigns(@TenantId() tenantId: string, @Query('accountId') accountId: string) {
    return this.linkedinAdsService.getCampaigns(tenantId, accountId);
  }

  @Get('linkedin/campaign/:id/insights')
  @ApiOperation({ summary: 'Statistiques Campagne LinkedIn', description: 'Récupère les statistiques d\'une campagne LinkedIn' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getLinkedInCampaignInsights(@TenantId() tenantId: string, @Param('id') campaignId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.linkedinAdsService.getCampaignInsights(tenantId, campaignId, startDate, endDate);
  }

  @Get('linkedin/campaigns/insights')
  @ApiOperation({ summary: 'Statistiques Toutes Campagnes LinkedIn', description: 'Récupère les statistiques de toutes les campagnes LinkedIn' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getAllLinkedInCampaignsInsights(@TenantId() tenantId: string, @Query('accountId') accountId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.linkedinAdsService.getAllCampaignsInsights(tenantId, accountId, startDate, endDate);
  }

  @Get('linkedin/campaign/:id/ads')
  @ApiOperation({ summary: 'Publicités LinkedIn', description: 'Récupère toutes les publicités d\'une campagne LinkedIn' })
  @ApiResponse({ status: 200, description: 'Publicités récupérées' })
  async getLinkedInCampaignAds(@TenantId() tenantId: string, @Param('id') campaignId: string) {
    return this.linkedinAdsService.getAds(tenantId, campaignId);
  }

  @Get('linkedin/ads/dashboard')
  @ApiOperation({ summary: 'Dashboard LinkedIn Ads', description: 'Récupère le dashboard complet LinkedIn Ads' })
  @ApiResponse({ status: 200, description: 'Dashboard récupéré' })
  async getLinkedInAdsDashboard(@TenantId() tenantId: string, @Query('accountId') accountId: string) {
    return this.linkedinAdsService.getAdsDashboard(tenantId, accountId);
  }

  // ==================== GLOBAL ====================

  @Get('status')
  @ApiOperation({ summary: 'Statut des intégrations', description: 'Récupère le statut de toutes les intégrations sociales' })
  @ApiResponse({ status: 200, description: 'Statut récupéré' })
  async getSocialStatus(@TenantId() tenantId: string) {
    return this.socialMediaService.getSocialStatus(tenantId);
  }
}
