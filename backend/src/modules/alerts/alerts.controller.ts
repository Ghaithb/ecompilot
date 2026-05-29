import { Controller, Get, UseGuards, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { StockAlertsService } from './stock-alerts.service';
import { PaymentsAlertsService } from './payments-alerts.service';
import { FinanceAlertsService } from './finance-alerts.service';
import { SecurityAlertsService } from './security-alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { AlertsRulesService } from './alerts-rules.service';

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AlertsController {
  constructor(
    private readonly stockAlertsService: StockAlertsService,
    private readonly paymentsAlertsService: PaymentsAlertsService,
    private readonly financeAlertsService: FinanceAlertsService,
    private readonly securityAlertsService: SecurityAlertsService,
    private readonly alertsRulesService: AlertsRulesService,
  ) {}


  @Get('stock')
  @ApiOperation({ summary: 'Get stock alerts', description: 'Retrieve current stock alerts for the tenant.' })
  @ApiResponse({ status: 200, description: 'List of stock alerts.' })
  async getStockAlerts(@TenantId() tenantId: string) {
    return this.stockAlertsService.getCurrentAlerts(tenantId);
  }


  @Get('stock/statistics')
  @ApiOperation({ summary: 'Get stock statistics', description: 'Retrieve stock statistics for the tenant.' })
  @ApiResponse({ status: 200, description: 'Stock statistics.' })
  async getStockStatistics(@TenantId() tenantId: string) {
    return this.stockAlertsService.getStockStatistics(tenantId);
  }


  @Get('payments')
  @ApiOperation({ summary: 'Get payment alerts', description: 'Retrieve payment alerts for the tenant.' })
  @ApiResponse({ status: 200, description: 'List of payment alerts.' })
  async getPaymentsAlerts(@TenantId() tenantId: string) {
    return this.paymentsAlertsService.getPaymentAlerts(tenantId);
  }


  @Get('finance')
  @ApiOperation({ summary: 'Get finance alerts', description: 'Retrieve finance alerts for the tenant.' })
  @ApiResponse({ status: 200, description: 'List of finance alerts.' })
  async getFinanceAlerts(@TenantId() tenantId: string) {
    return this.financeAlertsService.getFinanceAlerts(tenantId);
  }


  @Get('security')
  @ApiOperation({ summary: 'Get security alerts', description: 'Retrieve security alerts for the tenant.' })
  @ApiResponse({ status: 200, description: 'List of security alerts.' })
  async getSecurityAlerts(@TenantId() tenantId: string) {
    return this.securityAlertsService.getSecurityAlerts(tenantId);
  }


  // KPI Alert Rules CRUD
  @Get('rules')
  @ApiOperation({ summary: 'List alert rules', description: 'List all KPI alert rules for the tenant.' })
  @ApiResponse({ status: 200, description: 'List of alert rules.' })
  async listRules(@TenantId() tenantId: string) {
    return this.alertsRulesService.list(tenantId);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create alert rule', description: 'Create a new KPI alert rule.' })
  @ApiBody({ description: 'Alert rule payload', type: Object })
  @ApiResponse({ status: 201, description: 'Alert rule created.' })
  async createRule(@TenantId() tenantId: string, @Body() payload: any) {
    return this.alertsRulesService.create(tenantId, payload);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update alert rule', description: 'Update an existing KPI alert rule.' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiBody({ description: 'Alert rule update payload', type: Object })
  @ApiResponse({ status: 200, description: 'Alert rule updated.' })
  async updateRule(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: any) {
    return this.alertsRulesService.update(tenantId, id, payload);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete alert rule', description: 'Delete a KPI alert rule.' })
  @ApiParam({ name: 'id', description: 'Alert rule ID' })
  @ApiResponse({ status: 200, description: 'Alert rule deleted.' })
  async deleteRule(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.alertsRulesService.remove(tenantId, id);
  }
}