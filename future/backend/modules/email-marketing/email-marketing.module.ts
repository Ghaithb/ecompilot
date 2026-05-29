import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailMarketingController } from './email-marketing.controller';
import { EmailMarketingService } from './email-marketing.service';
import { EmailCampaign, EmailCampaignSchema } from './schemas/email-campaign.schema';
import { EmailTemplate, EmailTemplateSchema } from './schemas/email-template.schema';
import { EmailSubscriber, EmailSubscriberSchema } from './schemas/email-subscriber.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailCampaign.name, schema: EmailCampaignSchema },
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: EmailSubscriber.name, schema: EmailSubscriberSchema },
    ]),
  ],
  controllers: [EmailMarketingController],
  providers: [EmailMarketingService],
  exports: [EmailMarketingService],
})
export class EmailMarketingModule {}
