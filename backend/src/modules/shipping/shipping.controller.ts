import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ShippingProviderId } from './enums/shipping-provider.enum';
import { CompareRatesDto, CreateShipmentDto } from './dto/create-shipment.dto';
import { ShippingService } from './services/shipping.service';

@ApiTags('shipping')
@ApiBearerAuth()
@Controller('shipping')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Liste des transporteurs TN disponibles' })
  listProviders() {
    return this.shippingService.listProviders();
  }

  @Post('rates/compare')
  @ApiOperation({ summary: 'Comparer les tarifs INTIGO / First Delivery / Aramex' })
  compareRates(@TenantId() tenantId: string, @Body() dto: CompareRatesDto) {
    return this.shippingService.compareRates(tenantId, dto);
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Créer une expédition chez un transporteur' })
  createShipment(@TenantId() tenantId: string, @Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(tenantId, dto);
  }

  @Post('shipments/from-order/:orderId')
  @ApiOperation({ summary: 'Créer une expédition à partir d’une commande' })
  createFromOrder(
    @TenantId() tenantId: string,
    @Param('orderId') orderId: string,
    @Body() body: CreateShipmentDto,
  ) {
    return this.shippingService.createShipmentFromOrder(tenantId, orderId, body.provider, {
      weightKg: body.weightKg,
      localityId: body.localityId,
      notes: body.notes,
    });
  }

  @Get('track/:provider/:trackingNumber')
  @ApiOperation({ summary: 'Suivre un colis' })
  track(
    @Param('provider') provider: ShippingProviderId,
    @Param('trackingNumber') trackingNumber: string,
  ) {
    return this.shippingService.trackShipment(provider, trackingNumber);
  }

  @Post('shipments/:orderId/cancel')
  @ApiOperation({ summary: 'Annuler une expédition' })
  cancel(
    @TenantId() tenantId: string,
    @Param('orderId') orderId: string,
    @Body('provider') provider: ShippingProviderId,
  ) {
    return this.shippingService.cancelShipment(tenantId, orderId, provider);
  }

  @Get('first-delivery/localities')
  @ApiOperation({ summary: 'Localités First Delivery (locality_id)' })
  localities() {
    return this.shippingService.getFirstDeliveryLocalities();
  }
}
