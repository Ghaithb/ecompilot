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
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  /**
   * Récupérer le panier actuel
   */
  @Get()
  async getCart(
    @UserId() userId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      this.logger.log(`🛒 Récupération panier pour user: ${userId}`);
      return await this.cartService.getCart(userId, tenantId);
    } catch (error) {
      this.logger.error(`❌ Erreur récupération panier: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ajouter un produit au panier
   */
  @Post('add')
  async addItem(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Body() dto: {
      productId: string;
      quantity: number;
      options?: Record<string, any>;
    },
  ) {
    try {
      this.logger.log(`➕ Ajout produit ${dto.productId} au panier (x${dto.quantity})`);
      
      return await this.cartService.addItem(
        userId,
        tenantId,
        dto.productId,
        dto.quantity,
        dto.options,
      );
    } catch (error) {
      this.logger.error(`❌ Erreur ajout au panier: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mettre à jour la quantité d'un produit
   */
  @Put('update/:productId')
  async updateQuantity(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
    @Body() dto: { quantity: number },
  ) {
    try {
      this.logger.log(`🔄 Mise à jour quantité produit ${productId}: ${dto.quantity}`);
      
      return await this.cartService.updateQuantity(
        userId,
        tenantId,
        productId,
        dto.quantity,
      );
    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour quantité: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retirer un produit du panier
   */
  @Delete('remove/:productId')
  async removeItem(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
  ) {
    try {
      this.logger.log(`➖ Retrait produit ${productId} du panier`);
      
      return await this.cartService.removeItem(userId, tenantId, productId);
    } catch (error) {
      this.logger.error(`❌ Erreur retrait du panier: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vider le panier
   */
  @Delete('clear')
  async clearCart(
    @UserId() userId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      this.logger.log(`🗑️ Vidage du panier pour user: ${userId}`);
      
      return await this.cartService.clearCart(userId, tenantId);
    } catch (error) {
      this.logger.error(`❌ Erreur vidage panier: ${error.message}`);
      throw error;
    }
  }

  /**
   * Appliquer un code promo
   */
  @Post('coupon')
  async applyCoupon(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Body() dto: { couponCode: string },
  ) {
    try {
      this.logger.log(`🎟️ Application code promo: ${dto.couponCode}`);
      
      return await this.cartService.applyCoupon(
        userId,
        tenantId,
        dto.couponCode,
      );
    } catch (error) {
      this.logger.error(`❌ Erreur code promo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retirer le code promo
   */
  @Delete('coupon')
  async removeCoupon(
    @UserId() userId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      this.logger.log(`🚫 Retrait code promo`);
      
      return await this.cartService.removeCoupon(userId, tenantId);
    } catch (error) {
      this.logger.error(`❌ Erreur retrait code promo: ${error.message}`);
      throw error;
    }
  }
}
