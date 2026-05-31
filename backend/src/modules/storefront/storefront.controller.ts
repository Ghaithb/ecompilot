import { Controller, Get, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StorefrontService } from './storefront.service';

@ApiTags('public-storefront')
@Controller('public/storefront')
export class PublicStorefrontController {
  constructor(private storefront: StorefrontService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Store config + homepage intelligence' })
  async getStore(@Param('slug') slug: string) {
    try {
      return await this.storefront.getStore(slug);
    } catch {
      throw new NotFoundException('Boutique introuvable');
    }
  }

  @Get(':slug/products/:productId')
  @ApiOperation({ summary: 'Smart product page data' })
  async getProduct(@Param('slug') slug: string, @Param('productId') productId: string) {
    try {
      return await this.storefront.getProduct(slug, productId);
    } catch {
      throw new NotFoundException('Produit introuvable');
    }
  }

  @Get(':slug/cart/:sessionId/preview')
  @ApiOperation({ summary: 'Smart cart preview — shipping, upsells, free delivery progress' })
  async cartPreview(@Param('slug') slug: string, @Param('sessionId') sessionId: string) {
    try {
      return await this.storefront.getCartPreview(slug, sessionId);
    } catch {
      throw new NotFoundException('Panier introuvable');
    }
  }

  @Post(':slug/events')
  @ApiOperation({ summary: 'Store intelligence — lightweight event tracking' })
  track(
    @Param('slug') slug: string,
    @Body() body: { event: string; productId?: string; deviceType?: string; sessionId?: string },
  ) {
    return this.storefront.trackEvent(slug, body);
  }
}
