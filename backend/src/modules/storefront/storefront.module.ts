import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorefrontService } from './storefront.service';
import { PublicStorefrontController } from './storefront.controller';
import { WebsiteModule } from '../website/website.module';
import { ProductsModule } from '../products/products.module';
import { CartModule } from '../cart/cart.module';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricSchema,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: ConversionDailyMetric.name, schema: ConversionDailyMetricSchema },
    ]),
    WebsiteModule,
    ProductsModule,
    forwardRef(() => CartModule),
  ],
  controllers: [PublicStorefrontController],
  providers: [StorefrontService],
  exports: [StorefrontService],
})
export class StorefrontModule {}
