import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { RETURN_REASON_LABELS } from '../../common/enums/return-reason.enum';

@ApiTags('public-orders')
@Controller('public/orders')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('track')
  @ApiOperation({ summary: 'Suivi commande acheteur (numéro + téléphone)' })
  track(@Query('orderNumber') orderNumber: string, @Query('phone') phone: string) {
    return this.ordersService.trackPublicOrder(orderNumber, phone);
  }

  @Get('return-reasons')
  @ApiOperation({ summary: 'Raisons de refus standardisées' })
  returnReasons() {
    return RETURN_REASON_LABELS;
  }
}
