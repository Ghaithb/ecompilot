import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ConversionIntelligenceService } from './conversion-intelligence.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('conversion')
export class ConversionIntelligenceController {
  constructor(private readonly conversionService: ConversionIntelligenceService) {}

  @Get('abandoned-carts')
  @UseGuards(JwtAuthGuard)
  async getAbandonedCarts(
    @TenantId() tenantId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.conversionService.getAbandonedCarts(tenantId, { page, limit, status });
  }

  @Post('abandoned-carts/:id/remind')
  @UseGuards(JwtAuthGuard)
  async sendReminder(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.conversionService.triggerManualReminder(tenantId, id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@TenantId() tenantId: string) {
    return this.conversionService.getConversionStats(tenantId);
  }
}
