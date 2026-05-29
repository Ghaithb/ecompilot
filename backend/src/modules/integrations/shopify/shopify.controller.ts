import { Controller, Post, Body, Get, UseGuards, Param, Query, Headers, Req } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { TenantId } from '../../../common/decorators/tenant.decorator';

@Controller('integrations/shopify')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

  @Get('connect')
  async connect(
    @TenantId() tenantId: string,
    @Query('shop') shop: string,
    @Query('code') code?: string,
  ) {
    return this.shopifyService.connect(tenantId, shop, code || 'demo');
  }

  @Post('disconnect')
  async disconnect(@TenantId() tenantId: string) {
    return this.shopifyService.disconnect(tenantId);
  }

  @Get('callback')
  async oauthCallback(
    @TenantId() tenantId: string,
    @Query('hmac') hmac: string,
    @Query('code') code: string,
    @Query('shop') shop: string,
    @Query('state') state?: string,
    @Query() fullQuery?: Record<string, any>,
  ) {
    return this.shopifyService.handleCallback(tenantId, { hmac, code, shop, state, query: fullQuery || {} });
  }

  @Post('webhooks/:topic')
  async webhooks(
    @TenantId() tenantId: string,
    @Param('topic') topic: string,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    // If raw body is present (configured in main.ts), prefer it for HMAC
    const rawBody: Buffer | undefined = req?.body instanceof Buffer ? req.body : undefined;
    return this.shopifyService.handleWebhook(tenantId, topic, body, hmac, shopDomain, rawBody);
  }

  @Post('import/products')
  async importProducts(
    @TenantId() tenantId: string,
    @Body('products') products: any[],
  ) {
    return this.shopifyService.importProducts(tenantId, products);
  }

  @Post('import/orders')
  async importOrders(
    @TenantId() tenantId: string,
    @Body('orders') orders: any[],
  ) {
    return this.shopifyService.importOrders(tenantId, orders);
  }

  @Post('sync/product/:shopifyId')
  async syncProduct(
    @TenantId() tenantId: string,
    @Param('shopifyId') shopifyId: string,
    @Body() productData: any,
  ) {
    return this.shopifyService.syncProduct(tenantId, parseInt(shopifyId), productData);
  }

  @Get('status')
  async getSyncStatus(@TenantId() tenantId: string) {
    return this.shopifyService.getSyncStatus(tenantId);
  }

  @Post('export/products')
  async exportProducts(
    @TenantId() tenantId: string,
    @Body('products') products: any[],
  ) {
    return this.shopifyService.exportProductsToShopify(tenantId, products);
  }
}