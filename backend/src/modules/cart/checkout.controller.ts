import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { CartCheckoutService } from './cart-checkout.service';
import { CheckoutQuoteDto, CheckoutSubmitDto, CheckoutTrackStepDto } from './dto/checkout.dto';

@ApiTags('checkout')
@ApiBearerAuth()
@Controller('checkout')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user')
export class CheckoutController {
  constructor(
    private cart: CartService,
    private checkout: CartCheckoutService,
  ) {}

  @Post('start')
  @ApiOperation({ summary: 'Démarrer checkout — emit checkout.started + score' })
  async start(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() body?: { deviceType?: string },
  ) {
    const cart = await this.cart.getCart(userId, tenantId);
    return this.checkout.startCheckout(tenantId, cart, userId, body?.deviceType);
  }

  @Post('track-step')
  @ApiOperation({ summary: 'Track checkout step + behavioral signals' })
  async trackStep(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CheckoutTrackStepDto,
  ) {
    const cart = await this.cart.getCart(userId, tenantId);
    return this.checkout.trackCheckoutStep(tenantId, cart, dto);
  }

  @Post('predict-abandonment')
  predict(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CheckoutQuoteDto,
  ) {
    return this.cart.getCart(userId, tenantId).then((cart) =>
      this.checkout.predictAbandonment(tenantId, cart, dto.address),
    );
  }

  @Post('quote')
  @ApiOperation({ summary: 'Devis livraison + totaux checkout' })
  async quote(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CheckoutQuoteDto,
  ) {
    const cart = await this.cart.getCart(userId, tenantId);
    return this.checkout.getQuote(tenantId, cart, dto.address, dto.weightKg);
  }

  @Get('upsells')
  @ApiOperation({ summary: 'Produits recommandés (rule-based)' })
  upsells(
    @TenantId() tenantId: string,
    @Query('productIds') productIds: string,
    @Query('strategy') strategy?: 'auto' | 'upsell' | 'cross_sell',
  ) {
    const ids = productIds.split(',').filter(Boolean);
    return this.checkout.getUpsells(tenantId, ids, strategy || 'auto');
  }

  @Get('funnel-offers')
  @ApiOperation({ summary: 'Funnel upsell / cross-sell', description: 'Offres checkout, livraison gratuite et next-best-offer' })
  funnelOffers(
    @TenantId() tenantId: string,
    @Query('productIds') productIds: string,
    @Query('subtotal') subtotal?: string,
  ) {
    const ids = productIds.split(',').filter(Boolean);
    return this.checkout.getFunnelOffers(tenantId, ids, Number(subtotal) || 0);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Soumettre commande depuis panier (guest-friendly)' })
  submit(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CheckoutSubmitDto,
  ) {
    return this.cart.getCart(userId, tenantId).then((cart) =>
      this.checkout.submitCheckout(tenantId, cart, dto.address, { userId }),
    );
  }

  @Get('trust')
  trust() {
    return this.checkout.trustLayer();
  }
}
