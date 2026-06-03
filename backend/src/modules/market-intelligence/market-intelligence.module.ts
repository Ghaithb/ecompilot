import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinningProductsService } from './winning-products.service';
import { DeliveryIntelligenceService } from './delivery-intelligence.service';
import { MarketIntelligenceController } from './market-intelligence.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Shipment, ShipmentSchema } from '../delivery/schemas/shipment.schema';
import {
  ConversionDailyMetric,
  ConversionDailyMetricSchema,
} from '../conversion-intelligence/schemas/conversion-daily-metric.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Shipment.name, schema: ShipmentSchema },
      { name: ConversionDailyMetric.name, schema: ConversionDailyMetricSchema },
    ]),
  ],
  controllers: [MarketIntelligenceController],
  providers: [WinningProductsService, DeliveryIntelligenceService],
  exports: [WinningProductsService, DeliveryIntelligenceService],
})
export class MarketIntelligenceModule {}
