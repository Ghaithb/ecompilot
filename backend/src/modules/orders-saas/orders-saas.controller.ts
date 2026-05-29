import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { AppRole } from '../../common/enums/app-role.enum';
import { TenantApiGuards } from '../../core/http/tenant-api.guards';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';
import { OrdersSaasService } from './orders-saas.service';
import {
  createOrderSchema,
  linkShipmentSchema,
  listOrdersQuerySchema,
  updateOrderStatusSchema,
} from './schemas/order.zod';

@Controller('saas/orders')
@TenantApiGuards('saas-orders')
@Roles(AppRole.MERCHANT, AppRole.ADMIN, AppRole.SUPER_ADMIN, 'user')
export class OrdersSaasController {
  constructor(private readonly orders: OrdersSaasService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une commande (Prisma)' })
  create(
    @TenantId() tenantId: string,
    @Body(new ZodValidationPipe(createOrderSchema)) body: unknown,
  ) {
    return this.orders.create(tenantId, body as Parameters<OrdersSaasService['create']>[1]);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les commandes (paginé, multi-tenant)' })
  list(
    @TenantId() tenantId: string,
    @Query(new ZodValidationPipe(listOrdersQuerySchema)) query: unknown,
  ) {
    return this.orders.list(tenantId, query as Parameters<OrdersSaasService['list']>[1]);
  }

  @Get(':id/status/next')
  @ApiOperation({ summary: 'Transitions de statut autorisées' })
  async nextStatuses(@TenantId() tenantId: string, @Param('id') id: string) {
    const o = await this.orders.getById(tenantId, id);
    return {
      current: o.status,
      next: this.orders.listNextStatuses(o.status),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail commande' })
  getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.orders.getById(tenantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut (lifecycle)' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) body: unknown,
    @CurrentUser() user: { _id?: string; roles?: string[] },
  ) {
    return this.orders.updateStatus(
      tenantId,
      id,
      body as Parameters<OrdersSaasService['updateStatus']>[2],
      { id: user?._id?.toString(), roles: user?.roles },
    );
  }

  @Post(':id/shipment')
  @ApiOperation({ summary: 'Lier commande → expédition delivery' })
  linkShipment(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(linkShipmentSchema)) body: unknown,
    @CurrentUser() user: { _id?: string; roles?: string[] },
  ) {
    return this.orders.linkShipment(
      tenantId,
      id,
      body as Parameters<OrdersSaasService['linkShipment']>[2],
      { id: user?._id?.toString(), roles: user?.roles },
    );
  }
}
