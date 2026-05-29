import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('products')
  @ApiOperation({ 
    summary: 'Exporter les produits', 
    description: 'Exporte tous les produits au format CSV ou JSON' 
  })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json'], description: 'Format d\'export' })
  @ApiResponse({ status: 200, description: 'Données exportées' })
  async exportProducts(
    @TenantId() tenantId: string,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportProducts(tenantId, format);

    if (format === 'json') {
      return res.json(result);
    }

    // CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.data);
  }

  @Get('orders')
  @ApiOperation({ 
    summary: 'Exporter les commandes', 
    description: 'Exporte toutes les commandes au format CSV ou JSON' 
  })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json'], description: 'Format d\'export' })
  @ApiResponse({ status: 200, description: 'Données exportées' })
  async exportOrders(
    @TenantId() tenantId: string,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportOrders(tenantId, format);

    if (format === 'json') {
      return res.json(result);
    }

    // CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.data);
  }

  @Get('customers')
  @ApiOperation({ 
    summary: 'Exporter les clients', 
    description: 'Exporte tous les clients au format CSV ou JSON' 
  })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json'], description: 'Format d\'export' })
  @ApiResponse({ status: 200, description: 'Données exportées' })
  async exportCustomers(
    @TenantId() tenantId: string,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportCustomers(tenantId, format);

    if (format === 'json') {
      return res.json(result);
    }

    // CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.data);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Statistiques d\'export', 
    description: 'Retourne le nombre d\'éléments disponibles pour l\'export' 
  })
  @ApiResponse({ status: 200, description: 'Statistiques' })
  async getExportStats(@TenantId() tenantId: string) {
    return this.exportService.getExportStats(tenantId);
  }
}
