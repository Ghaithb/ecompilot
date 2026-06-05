import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinningProductsService } from './winning-products.service';
import { DeliveryIntelligenceService } from './delivery-intelligence.service';
import { ScrapingService } from './scraping.service';
import { MarketIntelligenceController } from './market-intelligence.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Shipment, ShipmentSchema } from '../delivery/schemas/shipment.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricSchema,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';
import { ProductTrend, ProductTrendSchema } from './schemas/product-trend.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Shipment.name, schema: ShipmentSchema },
      { name: ConversionDailyMetric.name, schema: ConversionDailyMetricSchema },
      { name: ProductTrend.name, schema: ProductTrendSchema },
    ]),
  ],
  controllers: [MarketIntelligenceController],
  providers: [
    WinningProductsService,
    DeliveryIntelligenceService,
    ScrapingService,
  ],
  exports: [
    WinningProductsService,
    DeliveryIntelligenceService,
    ScrapingService,
  ],
})
export class MarketIntelligenceModule {}
