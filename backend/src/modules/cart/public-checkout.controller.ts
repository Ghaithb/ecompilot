import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebsiteService } from '../website/website.service';
import { CartService } from './cart.service';
import { CartCheckoutService } from './cart-checkout.service';
import { CartAbandonmentService } from './cart-abandonment.service';
import { CheckoutQuoteDto, CheckoutSubmitDto, PublicCartSyncDto } from './dto/checkout.dto';

@ApiTags('public-checkout')
@Controller('public/checkout')
export class PublicCheckoutController {
  constructor(
    private website: WebsiteService,
    private cart: CartService,
    private checkout: CartCheckoutService,
    private abandonment: CartAbandonmentService,
  ) {}

  private async resolveTenant(slug: string) {
    const site = await this.website.findBySlug(slug);
    return {
      tenantId: site.tenantId?.toString?.() || String(site.tenantId),
      slug,
    };
  }

  @Post(':slug/cart/sync')
  @ApiOperation({ summary: 'Synchroniser panier invité (session)' })
  async syncCart(@Param('slug') slug: string, @Body() dto: PublicCartSyncDto) {
    const { tenantId } = await this.resolveTenant(slug);
    const cart = await this.cart.syncSessionCart(tenantId, dto.sessionId, {
      items: dto.items,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      storeSlug: slug,
    });
    return cart;
  }

  @Get(':slug/cart/:sessionId')
  async getSessionCart(@Param('slug') slug: string, @Param('sessionId') sessionId: string) {
    const { tenantId } = await this.resolveTenant(slug);
    return this.cart.getSessionCart(tenantId, sessionId);
  }

  @Post(':slug/quote')
  async quote(
    @Param('slug') slug: string,
    @Body() dto: CheckoutQuoteDto & { sessionId: string },
  ) {
    const { tenantId } = await this.resolveTenant(slug);
    const cart = await this.cart.getSessionCart(tenantId, dto.sessionId);
    return this.checkout.getQuote(tenantId, cart, dto.address, dto.weightKg);
  }

  @Get(':slug/upsells')
  async upsells(
    @Param('slug') slug: string,
    @Query('productIds') productIds: string,
    @Query('strategy') strategy?: 'auto' | 'upsell' | 'cross_sell',
  ) {
    const { tenantId } = await this.resolveTenant(slug);
    return this.checkout.getUpsells(tenantId, productIds.split(',').filter(Boolean), strategy || 'auto');
  }

  @Get(':slug/funnel-offers')
  async funnelOffers(
    @Param('slug') slug: string,
    @Query('productIds') productIds: string,
    @Query('subtotal') subtotal?: string,
  ) {
    const { tenantId } = await this.resolveTenant(slug);
    return this.checkout.getFunnelOffers(
      tenantId,
      productIds.split(',').filter(Boolean),
      Number(subtotal) || 0,
    );
  }

  @Post(':slug/submit')
  async submit(
    @Param('slug') slug: string,
    @Body() dto: CheckoutSubmitDto & { sessionId: string },
  ) {
    const { tenantId } = await this.resolveTenant(slug);
    const cart = await this.cart.getSessionCart(tenantId, dto.sessionId);
    return this.checkout.submitCheckout(tenantId, cart, dto.address, {
      sessionId: dto.sessionId,
    });
  }

  @Post(':slug/abandoned-cart')
  async abandoned(
    @Param('slug') slug: string,
    @Body()
    body: {
      sessionId?: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      items: Array<{ productId: string; productName: string; quantity: number; price: number; image?: string }>;
      totalAmount: number;
    },
  ) {
    const { tenantId } = await this.resolveTenant(slug);
    return this.abandonment.recordPublicAbandonedCart(tenantId, slug, body);
  }
}
