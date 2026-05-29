import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  create(@TenantId() tenantId: string, @Request() req, @Body() dto: any) {
    return this.poService.create(tenantId, req.user.userId, dto);
  }

  @Get()
  list(@TenantId() tenantId: string) {
    return this.poService.list(tenantId);
  }
}
