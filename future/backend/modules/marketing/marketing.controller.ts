import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { MarketingService } from './marketing.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('campaigns')
  async getCampaigns(
    @TenantId() tenantId: string,
    @Query('provider') provider?: string,
  ) {
    return this.marketingService.getCampaigns(tenantId, provider);
  }

  @Get('compare')
  async comparePerformance(
    @TenantId() tenantId: string,
    @Query('providers') providers?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const list = (providers || '').split(',').map(p => p.trim()).filter(Boolean);
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.marketingService.compare(tenantId, list, start, end);
  }
}
