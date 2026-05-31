import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ValidationPipe, UsePipes, Patch, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { WebsiteService } from './website.service';
import { PageService } from './page.service';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import { UpdateWebsiteDto, UpdateFeaturesDto } from './dto/update-website.dto';
import {
  UpdateStoreTemplateDto,
  UpdateWebsiteAnalyticsDto,
  UpdateWebsiteDomainDto,
  UpdateBrandingDto,
} from './dto/website-settings.dto';
import { WebsiteDomainService } from './website-domain.service';
import { STORE_TEMPLATES } from './constants/store-templates';

@ApiTags('website')
@ApiBearerAuth()
@Controller('website')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WebsiteController {
  constructor(
    private readonly websiteService: WebsiteService,
    private readonly pageService: PageService,
    private readonly domainService: WebsiteDomainService,
  ) {}

  // ==================== WEBSITE ====================

  @Post()
  @ApiOperation({ summary: 'Créer un site web', description: 'Crée un nouveau site web pour le tenant' })
  @ApiResponse({ status: 201, description: 'Site web créé' })
  async createWebsite(@TenantId() tenantId: string, @Body() createWebsiteDto: any) {
    return this.websiteService.create(tenantId, createWebsiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer le site web', description: 'Récupère le site web du tenant' })
  @ApiResponse({ status: 200, description: 'Site web récupéré' })
  async getWebsite(@TenantId() tenantId: string) {
    return this.websiteService.findByTenant(tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Mettre à jour le site web actuel', description: 'Met à jour le site web du tenant' })
  @ApiResponse({ status: 200, description: 'Site web mis à jour' })
  async updateCurrentWebsite(
    @TenantId() tenantId: string,
    @Body() updateWebsiteDto: any,
  ) {
    // Récupérer le site web du tenant et le mettre à jour
    const website = await this.websiteService.findByTenant(tenantId);
    if (!website) {
      return this.websiteService.create(tenantId, updateWebsiteDto);
    }
    return this.websiteService.update(website._id.toString(), tenantId, updateWebsiteDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour le site web par ID', description: 'Met à jour un site web spécifique' })
  @ApiResponse({ status: 200, description: 'Site web mis à jour' })
  async updateWebsite(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updateWebsiteDto: any,
  ) {
    return this.websiteService.update(id, tenantId, updateWebsiteDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publier le site web', description: 'Publie le site web' })
  @ApiResponse({ status: 200, description: 'Site web publié' })
  async publishWebsite(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.websiteService.publish(id, tenantId);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Dépublier le site web', description: 'Dépublie le site web' })
  @ApiResponse({ status: 200, description: 'Site web dépublié' })
  async unpublishWebsite(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.websiteService.unpublish(id, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer le site web', description: 'Supprime le site web' })
  @ApiResponse({ status: 200, description: 'Site web supprimé' })
  async deleteWebsite(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.websiteService.delete(id, tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques du site', description: 'Récupère les statistiques du site web' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getStats(@TenantId() tenantId: string) {
    return this.websiteService.getStats(tenantId);
  }

  // ==================== PAGES ====================

  @Post('pages')
  @ApiOperation({ summary: 'Créer une page', description: 'Crée une nouvelle page' })
  @ApiResponse({ status: 201, description: 'Page créée' })
  async createPage(@TenantId() tenantId: string, @Body() createPageDto: any) {
    return this.pageService.create(tenantId, createPageDto);
  }

  @Get('pages')
  @ApiOperation({ summary: 'Liste des pages', description: 'Récupère toutes les pages' })
  @ApiResponse({ status: 200, description: 'Pages récupérées' })
  async getPages(@TenantId() tenantId: string) {
    return this.pageService.findAll(tenantId);
  }

  @Get('pages/:id')
  @ApiOperation({ summary: 'Récupérer une page', description: 'Récupère une page par son ID' })
  @ApiResponse({ status: 200, description: 'Page récupérée' })
  async getPage(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pageService.findOne(id, tenantId);
  }

  @Put('pages/:id')
  @ApiOperation({ summary: 'Mettre à jour une page', description: 'Met à jour une page' })
  @ApiResponse({ status: 200, description: 'Page mise à jour' })
  async updatePage(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() updatePageDto: any,
  ) {
    return this.pageService.update(id, tenantId, updatePageDto);
  }

  @Post('pages/:id/publish')
  @ApiOperation({ summary: 'Publier une page', description: 'Publie une page' })
  @ApiResponse({ status: 200, description: 'Page publiée' })
  async publishPage(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pageService.publish(id, tenantId);
  }

  @Post('pages/:id/unpublish')
  @ApiOperation({ summary: 'Dépublier une page', description: 'Dépublie une page' })
  @ApiResponse({ status: 200, description: 'Page dépubliée' })
  async unpublishPage(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pageService.unpublish(id, tenantId);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Supprimer une page', description: 'Supprime une page' })
  @ApiResponse({ status: 200, description: 'Page supprimée' })
  async deletePage(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pageService.delete(id, tenantId);
  }

  @Post('pages/:id/duplicate')
  @ApiOperation({ summary: 'Dupliquer une page', description: 'Duplique une page' })
  @ApiResponse({ status: 201, description: 'Page dupliquée' })
  async duplicatePage(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pageService.duplicate(id, tenantId);
  }

  @Post('pages/reorder')
  @ApiOperation({ summary: 'Réorganiser les pages', description: 'Réorganise l\'ordre des pages' })
  @ApiResponse({ status: 200, description: 'Pages réorganisées' })
  async reorderPages(@TenantId() tenantId: string, @Body() body: { pages: { id: string; order: number }[] }) {
    return this.pageService.reorder(tenantId, body.pages);
  }

  @Post('generate')
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: false, // Autoriser les propriétés supplémentaires (au lieu de les rejeter)
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(err => ({
        field: err.property,
        errors: Object.values(err.constraints || {}),
        children: err.children,
      }));
      console.error('❌ Validation errors in generateWebsite:', JSON.stringify(messages, null, 2));
      return new BadRequestException({
        message: 'Validation échouée',
        errors: messages,
      });
    },
  }))
  @ApiOperation({ summary: 'Générer un site web automatiquement', description: 'Génère un site web complet basé sur les données du formulaire wizard' })
  @ApiResponse({ status: 201, description: 'Site web généré avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async generateWebsite(@TenantId() tenantId: string, @Body() wizardData: GenerateWebsiteDto) {
    return this.websiteService.generateWebsite(tenantId, wizardData);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Régénérer la page boutique',
    description: 'Met à jour le HTML public (checkout, produits) sans changer le slug',
  })
  @ApiResponse({ status: 200, description: 'Page régénérée' })
  async refreshStore(
    @TenantId() tenantId: string,
    @Body() body?: { phone?: string },
  ) {
    return this.websiteService.refreshStoreHtml(tenantId, body?.phone);
  }

  // ==================== CONFIGURATION & FEATURES ====================

  @Get('config')
  @ApiOperation({ summary: 'Récupérer la configuration complète', description: 'Récupère toute la configuration du site' })
  @ApiResponse({ status: 200, description: 'Configuration récupérée' })
  async getConfig(@TenantId() tenantId: string) {
    return this.websiteService.getWebsiteConfig(tenantId);
  }

  @Get('domain')
  @ApiOperation({ summary: 'Statut domaine personnalisé' })
  async getDomain(@TenantId() tenantId: string) {
    return this.domainService.getDomainStatus(tenantId);
  }

  @Patch('domain')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ summary: 'Configurer le domaine personnalisé' })
  async updateDomain(@TenantId() tenantId: string, @Body() dto: UpdateWebsiteDomainDto) {
    return this.domainService.updateCustomDomain(tenantId, dto.customDomain);
  }

  @Post('domain/verify')
  @ApiOperation({ summary: 'Vérifier la configuration DNS du domaine' })
  async verifyDomain(@TenantId() tenantId: string) {
    return this.domainService.verifyDns(tenantId);
  }

  @Patch('analytics')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ summary: 'Configurer GA4 et Meta Pixel' })
  async updateAnalytics(@TenantId() tenantId: string, @Body() dto: UpdateWebsiteAnalyticsDto) {
    return this.websiteService.updateAnalytics(tenantId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Liste des templates boutique COD' })
  listTemplates() {
    return Object.values(STORE_TEMPLATES);
  }

  @Patch('template')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ summary: 'Appliquer un template boutique' })
  async updateTemplate(@TenantId() tenantId: string, @Body() dto: UpdateStoreTemplateDto) {
    return this.websiteService.updateStoreTemplate(tenantId, dto.templateId);
  }

  @Patch('branding')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ summary: 'Logo, couverture et slogan de la boutique' })
  async updateBranding(@TenantId() tenantId: string, @Body() dto: UpdateBrandingDto) {
    return this.websiteService.updateBranding(tenantId, dto);
  }

  @Patch('features')
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true,
  }))
  @ApiOperation({ summary: 'Mettre à jour les fonctionnalités', description: 'Met à jour les fonctionnalités activées du site' })
  @ApiResponse({ status: 200, description: 'Fonctionnalités mises à jour' })
  async updateFeatures(@TenantId() tenantId: string, @Body() updateFeaturesDto: UpdateFeaturesDto) {
    return this.websiteService.updateFeatures(tenantId, updateFeaturesDto.features);
  }

  @Patch('features/:featureName/toggle')
  @ApiOperation({ summary: 'Activer/désactiver une fonctionnalité', description: 'Active ou désactive une fonctionnalité spécifique' })
  @ApiResponse({ status: 200, description: 'Fonctionnalité mise à jour' })
  async toggleFeature(
    @TenantId() tenantId: string,
    @Param('featureName') featureName: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.websiteService.toggleFeature(tenantId, featureName, body.enabled);
  }

  // ==================== SERVICES PERSONNALISÉS ====================

  @Get('services')
  @ApiOperation({ summary: 'Lister les services personnalisés', description: 'Récupère tous les services personnalisés' })
  @ApiResponse({ status: 200, description: 'Services récupérés' })
  async getCustomServices(@TenantId() tenantId: string) {
    return this.websiteService.getCustomServices(tenantId);
  }

  @Post('services')
  @ApiOperation({ summary: 'Ajouter un service personnalisé', description: 'Ajoute un nouveau service personnalisé' })
  @ApiResponse({ status: 201, description: 'Service ajouté' })
  async addCustomService(@TenantId() tenantId: string, @Body() service: any) {
    return this.websiteService.addCustomService(tenantId, service);
  }

  @Put('services/:serviceId')
  @ApiOperation({ summary: 'Mettre à jour un service', description: 'Met à jour un service personnalisé' })
  @ApiResponse({ status: 200, description: 'Service mis à jour' })
  async updateCustomService(
    @TenantId() tenantId: string,
    @Param('serviceId') serviceId: string,
    @Body() updates: any,
  ) {
    return this.websiteService.updateCustomService(tenantId, serviceId, updates);
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: 'Supprimer un service', description: 'Supprime un service personnalisé' })
  @ApiResponse({ status: 200, description: 'Service supprimé' })
  async deleteCustomService(
    @TenantId() tenantId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.websiteService.deleteCustomService(tenantId, serviceId);
  }
}
