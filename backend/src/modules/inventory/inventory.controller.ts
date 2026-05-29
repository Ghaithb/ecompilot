import { Controller, Get, UseGuards, Query, Patch, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  getSummary(@TenantId() tenantId: string) {
    return this.inventoryService.getSummary(tenantId);
  }

  @Get('items')
  getItems(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('stockStatus') stockStatus?: 'all' | 'ok' | 'low' | 'out',
    @Query('lowThreshold') lowThreshold?: string,
  ) {
    return this.inventoryService.getItems(tenantId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      category,
      stockStatus,
      lowThreshold: lowThreshold ? Number(lowThreshold) : undefined,
    });
  }

  @Patch(':productId/variants/:sku')
  adjustStock(
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
    @Param('sku') sku: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.adjustStock(tenantId, productId, sku, Number(quantity));
  }
}
