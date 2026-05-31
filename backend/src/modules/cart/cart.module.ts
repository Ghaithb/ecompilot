import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CheckoutController } from './checkout.controller';
import { PublicCheckoutController } from './public-checkout.controller';
import { CartService } from './cart.service';
import { CartCheckoutService } from './cart-checkout.service';
import { CartAbandonmentService } from './cart-abandonment.service';
import { CartRecoveryService } from './cart-recovery.service';
import { Cart, CartSchema } from './schemas/cart.schema';
import { ProductsModule } from '../products/products.module';
import { TenantsModule } from '../tenants/tenants.module';
import { OrdersModule } from '../orders/orders.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsiteModule } from '../website/website.module';
import { ConversionIntelligenceModule } from '../conversion-intelligence/conversion-intelligence.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule,
    TenantsModule,
    OrdersModule,
    DeliveryModule,
    EmailModule,
    WhatsAppModule,
    NotificationsModule,
    forwardRef(() => WebsiteModule),
    forwardRef(() => ConversionIntelligenceModule),
  ],
  controllers: [CartController, CheckoutController, PublicCheckoutController],
  providers: [
    CartService,
    CartCheckoutService,
    CartAbandonmentService,
    CartRecoveryService,
  ],
  exports: [CartService, CartAbandonmentService, CartCheckoutService, CartRecoveryService],
})
export class CartModule {}
