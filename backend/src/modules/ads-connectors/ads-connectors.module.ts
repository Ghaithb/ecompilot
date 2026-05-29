import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AdsConnectorsController } from './ads-connectors.controller';
import { GoogleAdsService } from './google-ads.service';
import { MetaAdsService } from './meta-ads.service';
import { TikTokAdsService } from './tiktok-ads.service';
import { AdAccount, AdAccountSchema } from './schemas/ad-account.schema';
import { AdCampaign, AdCampaignSchema } from './schemas/ad-campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdAccount.name, schema: AdAccountSchema },
      { name: AdCampaign.name, schema: AdCampaignSchema },
    ]),
    ConfigModule,
  ],
  controllers: [AdsConnectorsController],
  providers: [GoogleAdsService, MetaAdsService, TikTokAdsService],
  exports: [GoogleAdsService, MetaAdsService, TikTokAdsService],
})
export class AdsConnectorsModule {}
