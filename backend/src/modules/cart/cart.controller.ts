import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('merchant', 'admin', 'user')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@UserId() userId: string, @TenantId() tenantId: string) {
    return this.cartService.getCart(userId, tenantId);
  }

  @Get('abandoned')
  @ApiOperation({ summary: 'Paniers abandonnés (merchant)' })
  listAbandoned(@TenantId() tenantId: string) {
    return this.cartService.listAbandoned(tenantId);
  }

  @Get('abandoned/stats')
  abandonedStats(@TenantId() tenantId: string) {
    return this.cartService.getAbandonedStats(tenantId);
  }

  @Post('add')
  async addItem(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Body() dto: { productId: string; quantity: number; options?: Record<string, unknown> },
  ) {
    return this.cartService.addItem(
      { userId, tenantId },
      dto.productId,
      dto.quantity,
      dto.options,
    );
  }

  @Put('update/:productId')
  async updateQuantity(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: { quantity: number },
  ) {
    return this.cartService.updateQuantity(
      { userId, tenantId },
      productId,
      dto.quantity,
    );
  }

  @Delete('remove/:productId')
  async removeItem(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem({ userId, tenantId }, productId);
  }

  @Delete('clear')
  async clearCart(@UserId() userId: string, @TenantId() tenantId: string) {
    return this.cartService.clearCart({ userId, tenantId });
  }

  @Post('coupon')
  async applyCoupon(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Body() dto: { couponCode: string },
  ) {
    return this.cartService.applyCoupon({ userId, tenantId }, dto.couponCode);
  }

  @Delete('coupon')
  async removeCoupon(@UserId() userId: string, @TenantId() tenantId: string) {
    return this.cartService.removeCoupon({ userId, tenantId });
  }
}
