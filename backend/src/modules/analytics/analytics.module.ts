import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Shipment, ShipmentSchema } from '../delivery/schemas/shipment.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricSchema,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';
import { EventsModule } from '../../core/events/events.module';
import { RevenueAnalyticsService } from './revenue-analytics.service';
import { RevenueAnalyticsController } from './revenue-analytics.controller';
import { RevenueOpsDashboardService } from './revenue-ops-dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversionDailyMetric.name, schema: ConversionDailyMetricSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Shipment.name, schema: ShipmentSchema },
    ]),
    EventsModule,
  ],
  controllers: [RevenueAnalyticsController],
  providers: [RevenueAnalyticsService, RevenueOpsDashboardService],
  exports: [RevenueAnalyticsService, RevenueOpsDashboardService],
})
export class AnalyticsModule {}
