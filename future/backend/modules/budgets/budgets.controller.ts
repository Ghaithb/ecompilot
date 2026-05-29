import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { BudgetsService } from './budgets.service';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un budget', description: 'Crée un nouveau budget marketing pour une campagne' })
  @ApiResponse({ status: 201, description: 'Budget créé avec succès' })
  async create(@TenantId() tenantId: string, @Body() createBudgetDto: any) {
    return this.budgetsService.create(tenantId, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les budgets', description: 'Récupère tous les budgets du tenant avec filtres optionnels' })
  @ApiResponse({ status: 200, description: 'Liste des budgets' })
  async findAll(@TenantId() tenantId: string, @Query() filters: any) {
    return this.budgetsService.findAll(tenantId, filters);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Recommandations de budget', description: 'Obtient des recommandations IA pour optimiser les budgets' })
  @ApiResponse({ status: 200, description: 'Recommandations générées' })
  async getRecommendations(@TenantId() tenantId: string) {
    return this.budgetsService.getRecommendations(tenantId);
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simuler réallocation', description: 'Simule l\'impact d\'une réallocation de budget entre campagnes' })
  @ApiResponse({ status: 200, description: 'Simulation effectuée' })
  async simulateReallocation(@TenantId() tenantId: string, @Body() reallocationPlan: any) {
    return this.budgetsService.simulateReallocation(tenantId, reallocationPlan);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un budget', description: 'Récupère les détails d\'un budget spécifique' })
  @ApiResponse({ status: 200, description: 'Détails du budget' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.budgetsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un budget', description: 'Met à jour les informations d\'un budget' })
  @ApiResponse({ status: 200, description: 'Budget mis à jour' })
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() updateBudgetDto: any) {
    return this.budgetsService.update(tenantId, id, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un budget', description: 'Supprime un budget' })
  @ApiResponse({ status: 200, description: 'Budget supprimé' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.budgetsService.remove(tenantId, id);
    return { success: true };
  }

  @Post(':id/spending')
  @ApiOperation({ summary: 'Enregistrer une dépense', description: 'Enregistre une dépense sur un budget et met à jour les métriques' })
  @ApiResponse({ status: 200, description: 'Dépense enregistrée' })
  async recordSpending(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { amount: number; metrics?: any },
  ) {
    return this.budgetsService.recordSpending(tenantId, id, body.amount, body.metrics);
  }
}
