import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { DeliveryProviderId } from './enums/delivery-provider.enum';
import { CreateDeliveryShipmentDto, SaveProviderCredentialDto } from './dto/delivery.dto';
import { DeliveryProviderRegistry } from './services/delivery-provider-registry.service';
import { DeliveryService } from './services/delivery.service';
import { DeliveryCredentialsService } from './services/delivery-credentials.service';
import { OrderRiskEngineService } from './services/order-risk-engine.service';
import { DeliveryManifestService } from './services/delivery-manifest.service';

@ApiTags('delivery')
@ApiBearerAuth()
@Controller('delivery')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user', 'delivery_manager')
export class DeliveryController {
  constructor(
    private registry: DeliveryProviderRegistry,
    private delivery: DeliveryService,
    private credentials: DeliveryCredentialsService,
    private risk: OrderRiskEngineService,
    private manifestService: DeliveryManifestService,
  ) {}

  @Get('providers')
  @ApiOperation({ summary: 'Transporteurs disponibles (config par boutique)' })
  providers(@TenantId() tenantId: string) {
    return this.registry.listMeta(tenantId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Vue d’ensemble livraison' })
  async overview(@TenantId() tenantId: string) {
    const stats = await this.delivery.getShipmentStats(tenantId);
    const providers = await this.registry.listMeta(tenantId);
    return { stats, providers };
  }

  @Get('shipments')
  @ApiOperation({ summary: 'Liste des expéditions' })
  list(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    return this.delivery.listShipments(tenantId, { status, provider });
  }

  @Get('shipments/:shipmentId')
  @ApiOperation({ summary: 'Détail expédition' })
  getOne(@TenantId() tenantId: string, @Param('shipmentId') shipmentId: string) {
    return this.delivery.getShipment(tenantId, shipmentId);
  }

  @Get('shipments/stats')
  stats(@TenantId() tenantId: string) {
    return this.delivery.getShipmentStats(tenantId);
  }

  @Post('shipments/from-order/:orderId')
  create(
    @TenantId() tenantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreateDeliveryShipmentDto,
  ) {
    return this.delivery.createFromOrder(tenantId, orderId, dto.provider, {
      weightKg: dto.weightKg,
      localityId: dto.localityId,
      async: dto.async,
    });
  }

  @Post('shipments/:shipmentId/sync')
  sync(@TenantId() tenantId: string, @Param('shipmentId') shipmentId: string) {
    return this.delivery.syncTracking(tenantId, shipmentId);
  }

  @Post('shipments/:shipmentId/cancel')
  @ApiOperation({ summary: 'Annuler une expédition' })
  cancel(@TenantId() tenantId: string, @Param('shipmentId') shipmentId: string) {
    return this.delivery.cancelShipment(tenantId, shipmentId);
  }

  @Post('providers/:provider/test')
  @ApiOperation({ summary: 'Tester la connexion API transporteur' })
  testProvider(
    @TenantId() tenantId: string,
    @Param('provider') provider: DeliveryProviderId,
  ) {
    return this.delivery.testProviderConnection(tenantId, provider);
  }

  @Post('rates/compare/:orderId')
  compareRates(@TenantId() tenantId: string, @Param('orderId') orderId: string) {
    return this.delivery.compareRates(tenantId, orderId);
  }

  @Get('track/:provider/:trackingNumber')
  track(
    @TenantId() tenantId: string,
    @Param('provider') provider: DeliveryProviderId,
    @Param('trackingNumber') trackingNumber: string,
  ) {
    return this.registry.get(provider).trackOrder(trackingNumber, tenantId);
  }

  @Get('localities/first-delivery')
  localities(@TenantId() tenantId: string) {
    return this.registry.getFirstDelivery().getLocalities(tenantId);
  }

  @Get('manifests/:provider')
  @ApiOperation({ summary: 'Bordereau de remise transporteur (colis actifs)' })
  manifest(
    @TenantId() tenantId: string,
    @Param('provider') provider: DeliveryProviderId,
    @Query('format') format?: 'json' | 'html',
  ) {
    return this.manifestService.getManifest(tenantId, provider, format === 'html' ? 'html' : 'json');
  }

  @Get('settings/credentials')
  listCredentials(@TenantId() tenantId: string) {
    return this.credentials.listForTenant(tenantId);
  }

  @Post('settings/credentials')
  saveCredential(@TenantId() tenantId: string, @Body() dto: SaveProviderCredentialDto) {
    return this.credentials.saveCredential(tenantId, dto.provider, dto.token, {
      label: dto.label,
      apiUrl: dto.apiUrl,
    });
  }

  @Post('risk/assess')
  assessRisk(@TenantId() tenantId: string, @Body('phone') phone: string) {
    return this.risk.assessOrder(tenantId, phone);
  }
}
