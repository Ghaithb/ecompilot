import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { EmailMarketingService } from './email-marketing.service';

@ApiTags('email-marketing')
@ApiBearerAuth()
@Controller('email-marketing')
@UseGuards(JwtAuthGuard, TenantGuard)
export class EmailMarketingController {
  constructor(private readonly emailService: EmailMarketingService) {}

  @Get('campaigns')
  @ApiOperation({ summary: 'Liste des campagnes email' })
  getCampaigns(@TenantId() tenantId: string) {
    return this.emailService.getCampaigns(tenantId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Créer une campagne email' })
  createCampaign(@TenantId() tenantId: string, @Body() campaignDto: any) {
    return this.emailService.createCampaign(tenantId, campaignDto);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Détails campagne' })
  getCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.emailService.getCampaign(tenantId, id);
  }

  @Get('campaigns/:id/stats')
  @ApiOperation({ summary: 'Statistiques campagne' })
  getCampaignStats(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.emailService.getCampaignStats(tenantId, id);
  }

  @Post('campaigns/:id/send')
  @ApiOperation({ summary: 'Envoyer campagne' })
  sendCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.emailService.sendCampaign(tenantId, id);
  }

  @Get('subscribers')
  @ApiOperation({ summary: 'Liste des abonnés' })
  getSubscribers(@TenantId() tenantId: string) {
    return this.emailService.getSubscribers(tenantId);
  }

  @Post('subscribers')
  @ApiOperation({ summary: 'Ajouter un abonné' })
  addSubscriber(@TenantId() tenantId: string, @Body() subscriberDto: any) {
    return this.emailService.addSubscriber(tenantId, subscriberDto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Liste des templates' })
  getTemplates(@TenantId() tenantId: string) {
    return this.emailService.getTemplates(tenantId);
  }
}
