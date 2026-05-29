import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AppRole } from '../../common/enums/app-role.enum';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DriverService } from './driver.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';

@ApiTags('driver')
@ApiBearerAuth()
@Controller('driver')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(AppRole.DRIVER, AppRole.ADMIN, AppRole.SUPER_ADMIN)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques livreur du jour' })
  getStats(@TenantId() tenantId: string, @UserId() driverId: string) {
    return this.driverService.driverStats(tenantId, driverId);
  }

  @Get('deliveries')
  @ApiOperation({ summary: 'Liste des livraisons assignées' })
  listDeliveries(
    @TenantId() tenantId: string,
    @UserId() driverId: string,
    @Query('filter') filter?: 'today' | 'active' | 'done',
  ) {
    return this.driverService.listDeliveries(tenantId, driverId, filter || 'today');
  }

  @Get('deliveries/:orderId')
  @ApiOperation({ summary: 'Détail d\'une livraison' })
  getOne(
    @Param('orderId') orderId: string,
    @TenantId() tenantId: string,
    @UserId() driverId: string,
  ) {
    return this.driverService.getDelivery(orderId, tenantId, driverId);
  }

  @Patch('deliveries/:orderId/status')
  @ApiOperation({ summary: 'Mettre à jour le statut (livré, refusé, en route…)' })
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @TenantId() tenantId: string,
    @UserId() driverId: string,
    @CurrentUser() user: { roles?: string[] },
  ) {
    return this.driverService.updateDeliveryStatus(
      orderId,
      tenantId,
      driverId,
      dto,
      user?.roles || [],
    );
  }
}
