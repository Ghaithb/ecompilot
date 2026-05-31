import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { BillingPlanId, BillingService } from './billing.service';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user', 'marketing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Catalogue plans SaaS' })
  plans() {
    return this.billing.listPlans();
  }

  @Get('subscription')
  subscription(@TenantId() tenantId: string) {
    return this.billing.getSubscription(tenantId);
  }

  @Patch('plan')
  changePlan(@TenantId() tenantId: string, @Body('planId') planId: BillingPlanId) {
    return this.billing.changePlan(tenantId, planId);
  }
}
