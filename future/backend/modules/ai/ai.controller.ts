import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { 
  ChatCopilotDto, 
  GenerateContentDto, 
  OptimizePricingDto,
  MarketingStrategyDto 
} from './dto/ai.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // Assistant IA Copilote - Endpoint principal
  @Post('copilot/chat')
  async chatWithCopilot(
    @TenantId() tenantId: string,
    @Body() chatDto: ChatCopilotDto,
  ) {
    return this.aiService.chatWithCopilot(
      tenantId, 
      chatDto.message, 
      chatDto.context
    );
  }

  // Génération de contenu produit
  @Post('content/product')
  async generateProductContent(
    @TenantId() tenantId: string,
    @Body() contentDto: GenerateContentDto,
  ) {
    return this.aiService.generateProductContent(tenantId, contentDto.productData);
  }

  // Prévisions de ventes
  @Get('forecasts/sales')
  async getSalesForecasts(
    @TenantId() tenantId: string,
    @Query('period') period?: string,
  ) {
    return this.aiService.generateSalesForecasts(tenantId, period);
  }

  // Optimisation des prix
  @Post('pricing/optimize/:productId')
  async optimizePricing(
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.aiService.optimizePricing(tenantId, productId);
  }

  // Analyse des stocks
  @Get('inventory/analysis')
  async analyzeInventory(@TenantId() tenantId: string) {
    return this.aiService.analyzeInventory(tenantId);
  }

  // Stratégie marketing
  @Post('marketing/strategy')
  async generateMarketingStrategy(
    @TenantId() tenantId: string,
    @Body() strategyDto: MarketingStrategyDto,
  ) {
    return this.aiService.generateMarketingStrategy(tenantId, strategyDto);
  }

  // Analyse financière
  @Get('analytics/financial')
  async analyzeFinancials(
    @TenantId() tenantId: string,
    @Query('period') period?: string,
  ) {
    return this.aiService.analyzeFinancials(tenantId, period);
  }

  // Détection d'anomalies
  @Get('security/anomalies')
  async detectAnomalies(@TenantId() tenantId: string) {
    return this.aiService.detectAnomalies(tenantId);
  }

  // Dashboard IA - Insights globaux
  @Get('dashboard/insights')
  async getDashboardInsights(@TenantId() tenantId: string) {
    const [
      salesForecasts,
      inventoryAnalysis,
      financialAnalysis,
      anomalies
    ] = await Promise.all([
      this.aiService.generateSalesForecasts(tenantId, '7d'),
      this.aiService.analyzeInventory(tenantId),
      this.aiService.analyzeFinancials(tenantId, '30d'),
      this.aiService.detectAnomalies(tenantId),
    ]);

    return {
      salesForecasts,
      inventoryAnalysis,
      financialAnalysis,
      anomalies,
      generatedAt: new Date(),
    };
  }

  // Recommandations personnalisées
  @Get('recommendations')
  async getPersonalizedRecommendations(@TenantId() tenantId: string) {
    let insights: Record<string, unknown> = {};
    try {
      insights = await this.getDashboardInsights(tenantId);
    } catch {
      insights = { note: 'Insights indisponibles — mode dégradé' };
    }

    try {
      const recommendations = await this.aiService.chatWithCopilot(
        tenantId,
        `Basé sur ces données business, génère 5 recommandations prioritaires pour améliorer les performances:
      
      ${JSON.stringify(insights, null, 2)}
      
      Format: liste numérotée avec actions concrètes et impact estimé.`,
      );

      return {
        recommendations: recommendations.response,
        basedOn: insights,
        generatedAt: new Date(),
        source: 'ai',
      };
    } catch {
      return {
        recommendations: [
          '1. Publiez au moins 3 produits avec photos et prix en TND.',
          '2. Partagez le lien de votre boutique COD sur WhatsApp / TikTok.',
          '3. Activez les relances paniers abandonnés depuis le Centre conversion.',
          '4. Vérifiez vos numéros clients (format +216) pour réduire les échecs COD.',
          '5. Consultez le funnel conversion pour identifier où les clients quittent.',
        ].join('\n'),
        basedOn: insights,
        generatedAt: new Date(),
        source: 'fallback',
      };
    }
  }

  // Recommandations ML (basées sur interactions implicites)
  @Get('recommendations/ml')
  async getMlRecommendations(
    @TenantId() tenantId: string,
    @Query('userKey') userKey?: string,
  ) {
    return this.aiService.getMlRecommendations(tenantId, userKey);
  }
}

