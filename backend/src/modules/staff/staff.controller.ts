import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { StaffService } from './staff.service';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user', 'manager')
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Liste équipe (utilisateurs tenant)' })
  list(@TenantId() tenantId: string) {
    return this.staff.listStaff(tenantId);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Notes de frais (MVP vide)' })
  expenses() {
    return this.staff.listExpenses();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques équipe' })
  stats(@TenantId() tenantId: string) {
    return this.staff.getStats(tenantId);
  }

  @Post('expenses/:expenseId/review')
  @ApiOperation({ summary: 'Approuver / refuser note de frais (stub)' })
  review(
    @TenantId() tenantId: string,
    @Param('expenseId') expenseId: string,
    @Body() body: { status: string; rejectionReason?: string },
  ) {
    return this.staff.reviewExpense(tenantId, expenseId, body.status);
  }
}
