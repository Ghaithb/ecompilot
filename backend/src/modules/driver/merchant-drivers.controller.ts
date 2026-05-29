import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AppRole } from '../../common/enums/app-role.enum';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/current-user.decorator';
import { DriverManagementService } from './driver-management.service';
import { InviteDriverDto } from './dto/invite-driver.dto';

@ApiTags('merchants-drivers')
@ApiBearerAuth()
@Controller('merchants/drivers')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(AppRole.MERCHANT, AppRole.ADMIN, AppRole.SUPER_ADMIN, 'user')
export class MerchantDriversController {
  constructor(private readonly driverManagement: DriverManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des livreurs du commerçant' })
  getMyDrivers(@TenantId() tenantId: string) {
    return this.driverManagement.getDriversByTenant(tenantId);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Inviter un livreur (compte + WhatsApp)' })
  inviteDriver(
    @TenantId() tenantId: string,
    @UserId() merchantId: string,
    @Body() dto: InviteDriverDto,
  ) {
    return this.driverManagement.inviteDriver(tenantId, merchantId, dto);
  }

  @Patch(':driverId/toggle')
  @ApiOperation({ summary: 'Activer / désactiver un livreur' })
  toggle(
    @TenantId() tenantId: string,
    @Param('driverId') driverId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.driverManagement.toggleDriverActive(tenantId, driverId, isActive);
  }
}
