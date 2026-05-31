import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { MerchantApiKeysService } from './merchant-api-keys.service';

@ApiTags('merchant-api')
@ApiBearerAuth()
@Controller('merchant-api/keys')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user', 'marketing')
export class MerchantApiKeysController {
  constructor(private keys: MerchantApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les clés API marchand actives' })
  list(@TenantId() tenantId: string) {
    return this.keys.list(tenantId);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body('name') name: string) {
    return this.keys.create(tenantId, name);
  }

  @Delete(':id')
  revoke(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.keys.revoke(tenantId, id);
  }
}
