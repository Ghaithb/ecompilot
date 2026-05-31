import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RevenueAnalyticsService } from './revenue-analytics.service';
import { RevenueOpsDashboardService } from './revenue-ops-dashboard.service';
import { EventIdempotencyService } from '../../core/events/event-idempotency.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user')
export class RevenueAnalyticsController {
  constructor(
    private analytics: RevenueAnalyticsService,
    private revenueOps: RevenueOpsDashboardService,
    private eventLogs: EventIdempotencyService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Revenue Operations Dashboard — KPIs, insights, actions' })
  dashboard(@TenantId() tenantId: string) {
    return this.revenueOps.getDashboard(tenantId);
  }

  @Get('revenue-ops')
  @ApiOperation({ summary: 'Alias Revenue Operations Dashboard' })
  revenueOpsDashboard(@TenantId() tenantId: string) {
    return this.revenueOps.getDashboard(tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Revenue optimization analytics overview' })
  overview(@TenantId() tenantId: string) {
    return this.analytics.getOverview(tenantId);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Conversion funnel: Cart → Checkout → Order → Delivered' })
  async funnel(@TenantId() tenantId: string) {
    const data = await this.analytics.getOverview(tenantId);
    return { funnel: data.funnel, recoveryRate: data.recoveryRate };
  }

  @Get('channels')
  @ApiOperation({ summary: 'Recovery channel performance' })
  async channels(@TenantId() tenantId: string) {
    const data = await this.analytics.getOverview(tenantId);
    return data.channelPerformance;
  }

  @Get('carriers')
  @ApiOperation({ summary: 'Analytics transporteurs & régions (30 jours)' })
  carriers(@TenantId() tenantId: string) {
    return this.revenueOps.getCarrierRegionalAnalytics(tenantId);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Métriques ventes (période filtrable)' })
  sales(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('channel') channel?: string,
    @Query('category') category?: string,
  ) {
    return this.analytics.getSalesMetrics(tenantId, startDate, endDate, channel, category);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Métriques stock produits' })
  inventory(@TenantId() tenantId: string) {
    return this.analytics.getInventoryMetrics(tenantId);
  }

  @Get('visitors')
  @ApiOperation({ summary: 'Visiteurs boutique storefront (30 jours)' })
  visitors(@TenantId() tenantId: string, @Query('days') days?: string) {
    return this.analytics.getVisitorMetrics(tenantId, days ? parseInt(days, 10) : 30);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export CSV analytics' })
  async export(
    @TenantId() tenantId: string,
    @Query('type') type: 'sales' | 'inventory' | 'all' = 'all',
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res({ passthrough: true }) res?: Response,
  ) {
    if (format === 'json') {
      return {
        sales: await this.analytics.getSalesMetrics(tenantId),
        inventory: await this.analytics.getInventoryMetrics(tenantId),
      };
    }
    const csv = await this.analytics.exportCsv(tenantId, type);
    if (res) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}.csv"`);
    }
    return csv;
  }

  @Get('events/recent')
  @ApiOperation({ summary: 'Recent domain events (debug)' })
  recentEvents(@TenantId() tenantId: string) {
    return this.eventLogs.listRecent(tenantId);
  }

  @Get('events/dlq')
  @ApiOperation({ summary: 'Dead-letter queue events' })
  dlq(@TenantId() tenantId: string) {
    return this.eventLogs.listDlq(tenantId);
  }
}
