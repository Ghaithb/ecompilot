import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { DebugService } from './debug.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly debugService: DebugService) {}
  @Get('auth')
  @UseGuards(JwtAuthGuard)
  debugAuth(@Request() req) {
    return {
      message: 'Authentication successful',
      user: req.user,
      headers: {
        authorization: req.headers.authorization?.substring(0, 50) + '...',
      },
    };
  }

  @Get('tenant')
  @UseGuards(JwtAuthGuard, TenantGuard)
  debugTenant(@Request() req, @TenantId() tenantId: string) {
    return {
      message: 'Tenant guard successful',
      user: req.user,
      tenant: req.tenant,
      tenantId: tenantId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('no-auth')
  debugNoAuth() {
    return {
      message: 'No authentication required',
      timestamp: new Date().toISOString(),
    };
  }
}