import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Liste des plans disponibles', description: 'Récupère la liste des plans d\'abonnement disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des plans récupérée avec succès' })
  getAvailablePlans() {
    return this.subscriptionService.getAvailablePlans();
  }

  @Get('current')
  @ApiOperation({ summary: 'Abonnement actuel', description: 'Récupère l\'abonnement actuel du tenant' })
  @ApiResponse({ status: 200, description: 'Abonnement récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Aucun abonnement trouvé' })
  async getCurrentSubscription(@TenantId() tenantId: string) {
    return this.subscriptionService.getTenantSubscription(tenantId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Créer un abonnement', description: 'Crée un nouvel abonnement pour le tenant' })
  @ApiResponse({ status: 201, description: 'Abonnement créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou abonnement déjà existant' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  @ApiBody({
    schema: {
      properties: {
        planId: { type: 'string', description: 'ID du plan d\'abonnement' },
        stripeCustomerId: { type: 'string', description: 'ID client Stripe (optionnel)' },
      },
      required: ['planId']
    }
  })
  async createSubscription(
    @TenantId() tenantId: string,
    @Body('planId') planId: string,
    @Body('stripeCustomerId') stripeCustomerId?: string,
  ) {
    return this.subscriptionService.createSubscription(tenantId, planId, stripeCustomerId);
  }

  @Post('upgrade')
  async upgradeSubscription(
    @TenantId() tenantId: string,
    @Body('newPlanId') newPlanId: string,
  ) {
    return this.subscriptionService.upgradeSubscription(tenantId, newPlanId);
  }

  @Post('cancel')
  async cancelSubscription(
    @TenantId() tenantId: string,
    @Body('atPeriodEnd') atPeriodEnd = true,
  ) {
    return this.subscriptionService.cancelSubscription(tenantId, atPeriodEnd);
  }

  @Get('usage/:resource')
  async checkUsageLimits(
    @TenantId() tenantId: string,
    @Param('resource') resource: 'products' | 'orders' | 'users' | 'storage',
  ) {
    return this.subscriptionService.checkUsageLimits(tenantId, resource);
  }
}




