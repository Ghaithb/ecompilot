
import { Controller, Post, Body, Headers, Req, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { IntegrationsService } from './integrations.service';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
@UseGuards(JwtAuthGuard, TenantGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // Shopify Webhook
  @Post('shopify/webhooks')
  @ApiOperation({ summary: 'Webhook Shopify', description: 'Réceptionne les webhooks Shopify (produits, commandes, etc.)' })
  @ApiResponse({ status: 200, description: 'Webhook reçu' })
  async handleShopifyWebhook(@Req() req, @Headers('x-shopify-hmac-sha256') hmac: string) {
    return this.integrationsService.handleShopifyWebhook(req.body, hmac);
  }

  // WooCommerce Webhook
  @Post('woo/webhooks')
  @ApiOperation({ summary: 'Webhook WooCommerce', description: 'Réceptionne les webhooks WooCommerce' })
  @ApiResponse({ status: 200, description: 'Webhook reçu' })
  async handleWooWebhook(@Req() req, @Headers('x-wc-webhook-signature') signature: string) {
    return this.integrationsService.handleWooWebhook(req.body, signature);
  }

  // Liste des intégrations actives
  @Get()
  @ApiOperation({ summary: 'Lister les intégrations', description: 'Retourne la liste des intégrations actives pour le tenant' })
  @ApiResponse({ status: 200, description: 'Liste des intégrations' })
  async listIntegrations(@TenantId() tenantId: string) {
    return this.integrationsService.listIntegrations(tenantId);
  }
}
