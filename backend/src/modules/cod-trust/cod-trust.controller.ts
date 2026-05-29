import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CodTrustService } from './cod-trust.service';

@Controller('cod-trust')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CodTrustController {
  constructor(private readonly codTrustService: CodTrustService) {}

  @Get('blacklist')
  listBlacklist(@TenantId() tenantId: string) {
    return this.codTrustService.listBlacklist(tenantId);
  }

  @Post('blacklist')
  addToBlacklist(
    @TenantId() tenantId: string,
    @Body() body: { phone: string; reason?: string },
  ) {
    return this.codTrustService.addToBlacklist(tenantId, body.phone, body.reason);
  }

  @Delete('blacklist/:phone')
  removeFromBlacklist(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.codTrustService.removeFromBlacklist(tenantId, phone);
  }

  @Get('check/:phone')
  checkPhone(@TenantId() tenantId: string, @Param('phone') phone: string) {
    return this.codTrustService.getTrustScore(tenantId, phone);
  }

  @Post('delivery-refusal')
  recordRefusal(@TenantId() tenantId: string, @Body() body: { phone: string }) {
    return this.codTrustService.recordDeliveryRefusal(tenantId, body.phone);
  }
}
