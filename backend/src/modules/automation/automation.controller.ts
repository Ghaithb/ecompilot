import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  AutomationActionType,
  AutomationService,
  AutomationTrigger,
} from './automation.service';

@ApiTags('automation')
@ApiBearerAuth()
@Controller('automation')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user', 'marketing')
export class AutomationController {
  constructor(private automation: AutomationService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Triggers et actions disponibles' })
  catalog() {
    return this.automation.catalog();
  }

  @Get('rules')
  list(@TenantId() tenantId: string) {
    return this.automation.listRules(tenantId);
  }

  @Post('rules')
  create(
    @TenantId() tenantId: string,
    @Body()
    body: {
      name: string;
      trigger: AutomationTrigger;
      actions: Array<{ type: AutomationActionType; params?: Record<string, unknown> }>;
    },
  ) {
    return this.automation.createRule(tenantId, body);
  }

  @Patch('rules/:id/toggle')
  toggle(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.automation.toggleRule(tenantId, id, isActive);
  }

  @Post('dispatch')
  dispatch(
    @TenantId() tenantId: string,
    @Body() body: { trigger: AutomationTrigger; context?: Record<string, unknown> },
  ) {
    return this.automation.dispatch(tenantId, body.trigger, body.context || {});
  }
}
