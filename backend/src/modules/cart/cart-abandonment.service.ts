import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CartService } from './cart.service';

/** Inactivity detector — emits cart.abandoned events (recovery handled by event subscribers). */
@Injectable()
export class CartAbandonmentService {
  private readonly logger = new Logger(CartAbandonmentService.name);
  private detecting = false;

  constructor(
    private config: ConfigService,
    private cartService: CartService,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  @Cron('*/5 * * * *')
  async detectAbandonedCarts() {
    if (this.detecting) return;
    this.detecting = true;

    const minutes = this.config.get<number>('cart.abandonmentMinutes') || 30;
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    try {
      const stale = await this.cartModel.find({
        status: 'active',
        items: { $not: { $size: 0 } },
        lastActivityAt: { $lt: cutoff },
      }).limit(100);

      for (const cart of stale) {
        await this.cartService.markAsAbandoned(cart);
      }

      if (stale.length > 0) {
        this.logger.log(`${stale.length} panier(s) → event cart.abandoned`);
      }
    } finally {
      this.detecting = false;
    }
  }

  async recordPublicAbandonedCart(
    tenantId: string,
    slug: string,
    data: {
      sessionId?: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      items: Array<{ productId: string; productName: string; quantity: number; price: number; image?: string }>;
      totalAmount: number;
    },
  ) {
    const sessionId = data.sessionId || `guest-${Date.now()}`;
    const cart = await this.cartService.syncSessionCart(tenantId, sessionId, {
      items: data.items.map((i) => ({
        productId: i.productId,
        name: i.productName,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      storeSlug: slug,
    });

    if (cart.status === 'active' && cart.items.length > 0) {
      await this.cartService.markAsAbandoned(cart);
    }

    return { ok: true, cartId: cart._id.toString(), sessionId };
  }
}
