import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('shipping')
@ApiBearerAuth()
@Controller('shipping')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('shipments')
  @ApiOperation({ summary: 'Créer une expédition', description: 'Génère un bordereau d’expédition chez le transporteur' })
  createShipment(@Body() request: any) {
    return this.shippingService.createShipment(request);
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Suivre une expédition', description: 'Récupère le statut actuel d’un colis' })
  trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.shippingService.trackShipment(trackingNumber);
  }
}
