import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { AbandonedCartService } from './abandoned-cart.service';

@ApiTags('abandoned-cart')
@ApiBearerAuth()
@Controller('abandoned-cart')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AbandonedCartController {
  constructor(private readonly cartService: AbandonedCartService) {}

  @Get()
  @ApiOperation({ summary: 'Liste paniers abandonnés' })
  getAbandonedCarts(@TenantId() tenantId: string) {
    return this.cartService.getAbandonedCarts(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques recovery' })
  getStats(@TenantId() tenantId: string) {
    return this.cartService.getStats(tenantId);
  }

  @Get('conversion-center')
  @ApiOperation({ summary: 'Centre conversion actionnable' })
  getConversionCenter(@TenantId() tenantId: string) {
    return this.cartService.getConversionCenter(tenantId);
  }

  @Post(':id/send-reminder')
  @ApiOperation({ summary: 'Envoyer rappel' })
  sendReminder(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.cartService.sendReminder(tenantId, id);
  }
}
