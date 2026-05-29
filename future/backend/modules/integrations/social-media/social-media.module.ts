import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';
import { FacebookService } from './facebook.service';
import { InstagramService } from './instagram.service';
import { TwitterService } from './twitter.service';
import { LinkedinService } from './linkedin.service';
import { LinkedInAdsService } from './linkedin-ads.service';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    ConfigModule,
  ],
  controllers: [SocialMediaController],
  providers: [
    SocialMediaService,
    FacebookService,
    InstagramService,
    TwitterService,
    LinkedinService,
    LinkedInAdsService,
  ],
  exports: [
    SocialMediaService, 
    LinkedInAdsService
  ],
})
export class SocialMediaModule {}
