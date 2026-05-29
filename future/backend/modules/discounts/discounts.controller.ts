import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { DiscountsService } from './discounts.service';

@ApiTags('discounts')
@ApiBearerAuth()
@Controller('discounts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste codes promo' })
  getDiscounts(@TenantId() tenantId: string) {
    return this.discountsService.getDiscounts(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer code promo' })
  createDiscount(@TenantId() tenantId: string, @Body() data: any) {
    return this.discountsService.createDiscount(tenantId, data);
  }

  @Post('validate/:code')
  @ApiOperation({ summary: 'Valider un code' })
  validateCode(@TenantId() tenantId: string, @Param('code') code: string, @Body() orderData: any) {
    return this.discountsService.validateCode(tenantId, code, orderData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer code' })
  deleteDiscount(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.discountsService.deleteDiscount(tenantId, id);
  }
}
