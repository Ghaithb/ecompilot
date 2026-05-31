import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { CartRecoveryService } from '../../cart/cart-recovery.service';

/** Processes carts with due nextRecoveryAt — score-driven recovery V2. */
@Injectable()
export class SmartRecoveryScheduler {
  private readonly logger = new Logger(SmartRecoveryScheduler.name);
  private running = false;

  constructor(
    private config: ConfigService,
    private recovery: CartRecoveryService,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  @Cron('* * * * *')
  async processDueRecoveries() {
    if (!this.config.get<boolean>('cart.recoveryEnabled')) return;
    if (this.running) return;
    this.running = true;

    try {
      const due = await this.cartModel.find({
        status: 'abandoned',
        recoveryStage: { $lt: 3 },
        nextRecoveryAt: { $lte: new Date() },
        $or: [
          { conversionScore: { $lte: 80 } },
          { conversionScore: { $exists: false } },
        ],
      }).limit(20);

      for (const cart of due) {
        try {
          await this.recovery.sendSmartRecovery(cart);
        } catch (error) {
          this.logger.warn(`Recovery ${cart._id}: ${(error as Error).message}`);
        }
      }
    } finally {
      this.running = false;
    }
  }
}
