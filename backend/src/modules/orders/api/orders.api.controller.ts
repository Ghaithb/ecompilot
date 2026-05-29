import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantApiGuards } from '../../../core/http/tenant-api.guards';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { Permission } from '../../../core/rbac/permissions';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AppRole } from '../../../common/enums/app-role.enum';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { OrdersQueryService } from '../application/orders-query.service';
import { OrdersService } from '../orders.service';

/**
 * API tenant — commandes (couche HTTP isolée).
 * Routes legacy conservées sur OrdersController ; cette couche montre le pattern cible.
 */
@TenantApiGuards('orders-v2')
@Controller('orders/v2')
@Roles(AppRole.MERCHANT, AppRole.ADMIN, AppRole.SUPER_ADMIN, 'user')
export class OrdersApiController {
  constructor(
    private readonly query: OrdersQueryService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  @RequirePermission(Permission.ORDER_READ)
  @ApiOperation({ summary: '[v2] Liste commandes tenant' })
  @ApiResponse({ status: 200 })
  findAll(@Req() req: any) {
    return this.query.listForCurrentTenant(req);
  }

  @Get('returns/list')
  @RequirePermission(Permission.ORDER_READ)
  returns(@TenantId() tenantId: string) {
    return this.ordersService.findReturns(tenantId);
  }

  @Get(':id')
  @RequirePermission(Permission.ORDER_READ)
  @ApiOperation({ summary: '[v2] Détail commande' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.query.getById(tenantId, id);
  }
}
