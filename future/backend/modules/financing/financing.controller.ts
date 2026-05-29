import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FinancingService } from './financing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('financing')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FinancingController {
  constructor(private readonly financingService: FinancingService) {}

  @Post('simulate')
  simulate(@TenantId() tenantId: string, @Request() req, @Body('salesHistory') salesHistory: any) {
    return this.financingService.simulateRBF(tenantId, req.user.userId, salesHistory);
  }

  @Post('request')
  createRequest(@TenantId() tenantId: string, @Request() req, @Body() dto: any) {
    return this.financingService.createRequest(tenantId, req.user.userId, dto);
  }

  @Get('dashboard')
  dashboard(@TenantId() tenantId: string) {
    return this.financingService.getDashboard(tenantId);
  }
}
