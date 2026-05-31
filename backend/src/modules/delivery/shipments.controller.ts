import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CreateShipmentDto } from './dto/shipment.dto';
import { DeliveryService } from './services/delivery.service';

/**
 * API d'intégration livraison (ShipStation-style).
 * Préfixe global : /api/v1/shipments
 */
@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user', 'delivery_manager')
export class ShipmentsController {
  constructor(private delivery: DeliveryService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des expéditions (tenant)' })
  list(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    return this.delivery.listShipmentsPublic(tenantId, { status, provider });
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Suivi par numéro de tracking' })
  trackByNumber(
    @TenantId() tenantId: string,
    @Param('trackingNumber') trackingNumber: string,
  ) {
    return this.delivery.trackByTrackingNumber(tenantId, trackingNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail expédition par ID' })
  getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.delivery.getShipmentPublic(tenantId, id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Créer une expédition depuis une commande' })
  create(@TenantId() tenantId: string, @Body() dto: CreateShipmentDto) {
    return this.delivery.createFromOrder(tenantId, dto.orderId, dto.provider, {
      weightKg: dto.weightKg,
      localityId: dto.localityId,
      async: dto.async,
    });
  }
}
