import { Controller, Get, Post, Delete, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { GoogleAdsService } from './google-ads.service';
import { MetaAdsService } from './meta-ads.service';
import { TikTokAdsService } from './tiktok-ads.service';

@ApiTags('ads-connectors')
@ApiBearerAuth()
@Controller('ads')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AdsConnectorsController {
  constructor(
    private readonly googleAdsService: GoogleAdsService,
    private readonly metaAdsService: MetaAdsService,
    private readonly tiktokAdsService: TikTokAdsService,
  ) {}

  // ==================== GOOGLE ADS ====================

  @Get('google/authorize')
  @ApiOperation({ summary: 'Autoriser Google Ads', description: 'Génère l\'URL d\'autorisation OAuth Google Ads' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeGoogle(@TenantId() tenantId: string) {
    return this.googleAdsService.authorize(tenantId);
  }

  @Get('google/connect')
  @ApiOperation({ summary: 'Connecter Google Ads', description: 'Gère le callback OAuth Google Ads' })
  @ApiResponse({ status: 200, description: 'Google Ads connecté' })
  async connectGoogle(@TenantId() tenantId: string, @Query('code') code: string) {
    return this.googleAdsService.handleCallback(tenantId, code);
  }

  @Post('google/:accountId/sync')
  @ApiOperation({ summary: 'Synchroniser Google Ads', description: 'Synchronise les campagnes Google Ads' })
  @ApiResponse({ status: 200, description: 'Campagnes synchronisées' })
  async syncGoogle(@TenantId() tenantId: string, @Param('accountId') accountId: string) {
    return this.googleAdsService.syncCampaigns(tenantId, accountId);
  }

  @Get('google/campaigns')
  @ApiOperation({ summary: 'Lister campagnes Google Ads', description: 'Récupère les campagnes Google Ads' })
  @ApiResponse({ status: 200, description: 'Liste des campagnes' })
  async getGoogleCampaigns(@TenantId() tenantId: string, @Query('accountId') accountId?: string) {
    return this.googleAdsService.getCampaigns(tenantId, accountId);
  }

  @Delete('google/:accountId')
  @ApiOperation({ summary: 'Déconnecter Google Ads', description: 'Déconnecte le compte Google Ads' })
  @ApiResponse({ status: 200, description: 'Compte déconnecté' })
  async disconnectGoogle(@TenantId() tenantId: string, @Param('accountId') accountId: string) {
    return this.googleAdsService.disconnect(tenantId, accountId);
  }

  // ==================== META ADS ====================

  @Get('meta/authorize')
  @ApiOperation({ summary: 'Autoriser Meta Ads', description: 'Génère l\'URL d\'autorisation OAuth Meta Ads' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeMeta(@TenantId() tenantId: string) {
    return this.metaAdsService.authorize(tenantId);
  }

  @Get('meta/connect')
  @ApiOperation({ summary: 'Connecter Meta Ads', description: 'Gère le callback OAuth Meta Ads' })
  @ApiResponse({ status: 200, description: 'Meta Ads connecté' })
  async connectMeta(@TenantId() tenantId: string, @Query('code') code: string) {
    return this.metaAdsService.handleCallback(tenantId, code);
  }

  @Post('meta/:accountId/sync')
  @ApiOperation({ summary: 'Synchroniser Meta Ads', description: 'Synchronise les campagnes Meta Ads' })
  @ApiResponse({ status: 200, description: 'Campagnes synchronisées' })
  async syncMeta(@TenantId() tenantId: string, @Param('accountId') accountId: string) {
    return this.metaAdsService.syncCampaigns(tenantId, accountId);
  }

  @Get('meta/campaigns')
  @ApiOperation({ summary: 'Lister campagnes Meta Ads', description: 'Récupère les campagnes Meta Ads' })
  @ApiResponse({ status: 200, description: 'Liste des campagnes' })
  async getMetaCampaigns(@TenantId() tenantId: string, @Query('accountId') accountId?: string) {
    return this.metaAdsService.getCampaigns(tenantId, accountId);
  }

  @Delete('meta/:accountId')
  @ApiOperation({ summary: 'Déconnecter Meta Ads', description: 'Déconnecte le compte Meta Ads' })
  @ApiResponse({ status: 200, description: 'Compte déconnecté' })
  async disconnectMeta(@TenantId() tenantId: string, @Param('accountId') accountId: string) {
    return this.metaAdsService.disconnect(tenantId, accountId);
  }

  // ==================== TIKTOK ADS ====================

  @Get('tiktok/authorize')
  @ApiOperation({ summary: 'Autoriser TikTok Ads', description: 'Génère l\'URL d\'autorisation OAuth TikTok Ads' })
  @ApiResponse({ status: 200, description: 'URL d\'autorisation générée' })
  async authorizeTikTok(@TenantId() tenantId: string) {
    return this.tiktokAdsService.authorize(tenantId);
  }

  @Get('tiktok/connect')
  @ApiOperation({ summary: 'Connecter TikTok Ads', description: 'Gère le callback OAuth TikTok Ads' })
  @ApiResponse({ status: 200, description: 'TikTok Ads connecté' })
  async connectTikTok(@TenantId() tenantId: string, @Query('auth_code') authCode: string) {
    return this.tiktokAdsService.handleCallback(tenantId, authCode);
  }

  @Post('tiktok/:accountId/sync')
  @ApiOperation({ summary: 'Synchroniser TikTok Ads', description: 'Synchronise les campagnes TikTok Ads' })
  @ApiResponse({ status: 200, description: 'Campagnes synchronisées' })
  async syncTikTok(@TenantId() tenantId: string, @Param('accountId') accountId: string) {
    return this.tiktokAdsService.syncCampaigns(tenantId, accountId);
  }

  @Get('tiktok/campaigns')
  @ApiOperation({ summary: 'Lister campagnes TikTok Ads', description: 'Récupère les campagnes TikTok Ads' })
  @ApiResponse({ status: 200, description: 'Liste des campagnes' })
  async getTikTokCampaigns(@TenantId() tenantId: string, @Query('accountId') accountId?: string) {
    return this.tiktokAdsService.getCampaigns(tenantId, accountId);
  }

  @Delete('tiktok/:accountId')
  @ApiOperation({ summary: 'Déconnecter TikTok Ads', description: 'Déconnecte le compte TikTok Ads' })
  @ApiResponse({ status: 200, description: 'Compte déconnecté' })
  async disconnectTikTok(@TenantId() tenantId: string, @Param('accountId') accountId: string) {
    return this.tiktokAdsService.disconnect(tenantId, accountId);
  }

  // ==================== GLOBAL ====================

  @Get('campaigns/all')
  @ApiOperation({ summary: 'Toutes les campagnes', description: 'Récupère toutes les campagnes de toutes les plateformes' })
  @ApiResponse({ status: 200, description: 'Liste consolidée des campagnes' })
  async getAllCampaigns(@TenantId() tenantId: string) {
    const [google, meta, tiktok] = await Promise.all([
      this.googleAdsService.getCampaigns(tenantId),
      this.metaAdsService.getCampaigns(tenantId),
      this.tiktokAdsService.getCampaigns(tenantId),
    ]);

    return {
      google: google.length,
      meta: meta.length,
      tiktok: tiktok.length,
      total: google.length + meta.length + tiktok.length,
      campaigns: [...google, ...meta, ...tiktok],
    };
  }
}
