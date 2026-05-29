import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CompleteOnboardingSurveyDto } from './dto/onboarding-survey.dto';

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Statut d\'onboarding',
    description: 'Retourne le statut de progression de l\'onboarding',
  })
  @ApiResponse({ status: 200, description: 'Statut récupéré' })
  async getStatus(@TenantId() tenantId: string) {
    return this.onboardingService.getOnboardingStatus(tenantId);
  }

  @Get('next-steps')
  @ApiOperation({
    summary: 'Prochaines étapes',
    description: 'Retourne les prochaines étapes recommandées',
  })
  @ApiResponse({ status: 200, description: 'Recommandations récupérées' })
  async getNextSteps(@TenantId() tenantId: string) {
    return this.onboardingService.getNextSteps(tenantId);
  }

  @Post('complete-step')
  @ApiOperation({
    summary: 'Compléter une étape',
    description: 'Marque une étape d\'onboarding comme complétée',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        step: {
          type: 'string',
          enum: ['productsAdded', 'integrationsConfigured', 'firstCampaignLaunched'],
          description: 'Nom de l\'étape à compléter',
        },
      },
      required: ['step'],
    },
  })
  @ApiResponse({ status: 200, description: 'Étape complétée' })
  @ApiResponse({ status: 400, description: 'Étape invalide' })
  async completeStep(
    @TenantId() tenantId: string,
    @Body('step') step: string,
  ) {
    return this.onboardingService.completeStep(tenantId, step);
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Réinitialiser l\'onboarding',
    description: 'Réinitialise le statut d\'onboarding (pour les tests)',
  })
  @ApiResponse({ status: 200, description: 'Onboarding réinitialisé' })
  async resetOnboarding(@TenantId() tenantId: string) {
    return this.onboardingService.resetOnboarding(tenantId);
  }

  // === QUESTIONNAIRE D'ONBOARDING ===

  @Get('survey/status')
  @ApiOperation({
    summary: 'Vérifier si le questionnaire est complété',
    description: 'Retourne le statut de complétion du questionnaire d\'onboarding',
  })
  @ApiResponse({ status: 200, description: 'Statut récupéré' })
  async checkSurveyStatus(@Request() req) {
    const userId = req.user.userId;
    const completed = await this.onboardingService.hasSurveyCompleted(userId);
    return {
      completed,
      userId,
    };
  }

  @Get('survey')
  @ApiOperation({
    summary: 'Obtenir le questionnaire',
    description: 'Récupère le questionnaire d\'onboarding de l\'utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Questionnaire récupéré' })
  async getSurvey(@Request() req) {
    const userId = req.user.userId;
    return this.onboardingService.getSurvey(userId);
  }

  @Post('survey/complete')
  @ApiOperation({
    summary: 'Compléter le questionnaire d\'onboarding',
    description: 'Soumet les réponses au questionnaire et génère des recommandations personnalisées',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Questionnaire complété avec succès, recommandations générées',
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiBody({ type: CompleteOnboardingSurveyDto })
  async completeSurvey(
    @Request() req,
    @TenantId() tenantId: string,
    @Body() surveyData: CompleteOnboardingSurveyDto,
  ) {
    const userId = req.user.userId;
    return this.onboardingService.completeSurvey(userId, tenantId, surveyData);
  }

  @Get('survey/stats')
  @ApiOperation({
    summary: 'Statistiques des questionnaires (Admin)',
    description: 'Récupère les statistiques globales des questionnaires',
  })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getSurveyStats() {
    return this.onboardingService.getSurveyStats();
  }
}
