
import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
// ...existing imports...
import { generateAnalyticsPdf } from './pdf-export.util';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}


  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard insights', description: 'Retrieve dashboard analytics insights for the tenant.' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics insights.' })
  async getDashboardInsights(@TenantId() tenantId: string) {
    return this.analyticsService.getDashboardInsights(tenantId);
  }


  @Get('sales')
  @ApiOperation({ summary: 'Get sales metrics', description: 'Retrieve sales metrics for the tenant.' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Sales metrics.' })
  async getSalesMetrics(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getSalesMetrics(tenantId, start, end);
  }


  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory metrics', description: 'Retrieve inventory metrics for the tenant.' })
  @ApiResponse({ status: 200, description: 'Inventory metrics.' })
  async getInventoryMetrics(@TenantId() tenantId: string) {
    return this.analyticsService.getInventoryMetrics(tenantId);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products', description: 'Retrieve top selling products for the tenant.' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return', type: Number })
  @ApiResponse({ status: 200, description: 'Top selling products.' })
  async getTopProducts(
    @TenantId() tenantId: string,
    @Query('limit') limit?: string,
  ) {
    const metrics = await this.analyticsService.getSalesMetrics(tenantId);
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return {
      topProducts: metrics.topSellingProducts.slice(0, limitNum),
    };
  }

  @Get('cod-delivery')
  @ApiOperation({ summary: 'Get COD and delivery metrics', description: 'Retrieve cash-on-delivery and delivery analytics.' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getCodDelivery(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getCodDeliveryMetrics(tenantId, start, end);
  }

  @Get('product-performance')
  @ApiOperation({ summary: 'Get product performance analytics', description: 'Retrieve product sales percentages and winning product.' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getProductPerformance(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getProductAnalytics(tenantId, start, end);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get order funnel metrics', description: 'Retrieve order pipeline funnel data.' })
  async getFunnel(@TenantId() tenantId: string) {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);
    return this.analyticsService.getOrderFunnel(tenantId, periodStart);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data', description: 'Retrieve revenue data for chart visualization.' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to include', type: Number })
  @ApiResponse({ status: 200, description: 'Revenue chart data.' })
  async getRevenueChart(
    @TenantId() tenantId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const metrics = await this.analyticsService.getSalesMetrics(tenantId, startDate, endDate);
    
    return {
      labels: metrics.revenueByPeriod.map((item) => item.period),
      datasets: [
        {
          label: 'Revenu (TND)',
          data: metrics.revenueByPeriod.map((item) => item.revenue),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Commandes',
          data: metrics.revenueByPeriod.map((item) => item.orders),
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }


  @Get('export')
  @ApiOperation({ summary: 'Export analytics data', description: 'Export analytics data as CSV, JSON, or PDF.' })
  @ApiQuery({ name: 'type', required: false, enum: ['sales', 'inventory', 'all'], description: 'Type of data to export' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json', 'pdf'], description: 'Export format' })
  @ApiResponse({ status: 200, description: 'Exported analytics data (CSV, JSON, or PDF).' })
  async exportData(
    @TenantId() tenantId: string,
    @Query('type') type: 'sales' | 'inventory' | 'all' = 'all',
    @Query('format') format: string = 'json',
    @Res() res: Response,
  ) {
  const data = await this.analyticsService.exportData(tenantId, type, (format === 'pdf' ? 'json' : format) as 'csv' | 'json');
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(data);
    } else if (format === 'pdf') {
      const pdfBuffer = generateAnalyticsPdf(data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.json(data);
    }
  }
}

