import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { Integration, IntegrationSchema } from './schemas/integration.schema';
import { ShopifyIntegrationModule } from './shopify/shopify.module';
import { SocialMediaModule } from './social-media/social-media.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Integration.name, schema: IntegrationSchema },
    ]),
    ShopifyIntegrationModule,
    SocialMediaModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
