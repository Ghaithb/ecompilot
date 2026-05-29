import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PersonalizationEngineService } from './personalization-engine.service';
import { ContentVariationsService } from './content-variations.service';
import { SmartRecommendationsService } from './smart-recommendations.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { TenantsModule } from '../tenants/tenants.module';
import { MlClient } from '../../common/clients/ml.client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    TenantsModule,
  ],
  controllers: [AiController],
  providers: [
    AiService, 
    PersonalizationEngineService,
    ContentVariationsService,
    SmartRecommendationsService,
    MlClient
  ],
  exports: [
    AiService, 
    PersonalizationEngineService,
    ContentVariationsService,
    SmartRecommendationsService,
    MlClient
  ],
})
export class AiModule {}

