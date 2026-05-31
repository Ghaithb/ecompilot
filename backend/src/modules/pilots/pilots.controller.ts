import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { PilotsService } from './pilots.service';

@ApiTags('pilots')
@Controller('pilots')
export class PilotsController {
  constructor(private pilots: PilotsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Places pilotes restantes (public)' })
  status() {
    return this.pilots.getStatus();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('merchant', 'admin', 'user', 'marketing')
  me(@TenantId() tenantId: string) {
    return this.pilots.getStatus(tenantId);
  }

  @Post('enroll')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('merchant', 'admin', 'user', 'marketing')
  enroll(@TenantId() tenantId: string, @Body('source') source?: string) {
    return this.pilots.enroll(tenantId, source || 'app');
  }
}
