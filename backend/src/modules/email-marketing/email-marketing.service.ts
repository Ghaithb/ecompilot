import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailCampaign, EmailCampaignDocument, CampaignStatus } from './schemas/email-campaign.schema';
import { EmailTemplate, EmailTemplateDocument } from './schemas/email-template.schema';
import { EmailSubscriber, EmailSubscriberDocument } from './schemas/email-subscriber.schema';

@Injectable()
export class EmailMarketingService {
  constructor(
    @InjectModel(EmailCampaign.name) private campaignModel: Model<EmailCampaignDocument>,
    @InjectModel(EmailTemplate.name) private templateModel: Model<EmailTemplateDocument>,
    @InjectModel(EmailSubscriber.name) private subscriberModel: Model<EmailSubscriberDocument>,
  ) {}

  async getCampaigns(tenantId: string) {
    const campaigns = await this.campaignModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
    return { campaigns, count: campaigns.length };
  }

  async createCampaign(tenantId: string, data: any) {
    const campaign = new this.campaignModel({
      tenantId,
      ...data,
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 },
    });
    return campaign.save();
  }

  async getCampaign(tenantId: string, id: string) {
    return this.campaignModel.findOne({ _id: id, tenantId }).lean();
  }

  async getCampaignStats(tenantId: string, id: string) {
    const campaign = await this.campaignModel.findOne({ _id: id, tenantId }).lean();
    return campaign?.stats || {};
  }

  async sendCampaign(tenantId: string, id: string) {
    const campaign = await this.campaignModel.findOne({ _id: id, tenantId });
    if (!campaign) throw new Error('Campaign not found');
    
    campaign.status = CampaignStatus.SENDING;
    campaign.sentAt = new Date();
    await campaign.save();

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    return { message: 'Campaign queued for sending', campaignId: id };
  }

  async getSubscribers(tenantId: string) {
    const subscribers = await this.subscriberModel.find({ tenantId, isSubscribed: true }).lean();
    return { subscribers, count: subscribers.length };
  }

  async addSubscriber(tenantId: string, data: any) {
    const existing = await this.subscriberModel.findOne({ tenantId, email: data.email });
    if (existing) {
      existing.isSubscribed = true;
      existing.subscribedAt = new Date();
      return existing.save();
    }
    
    const subscriber = new this.subscriberModel({
      tenantId,
      ...data,
      isSubscribed: true,
      subscribedAt: new Date(),
      stats: { emailsSent: 0, emailsOpened: 0, emailsClicked: 0 },
    });
    return subscriber.save();
  }

  async getTemplates(tenantId: string) {
    const templates = await this.templateModel.find({ tenantId, isActive: true }).lean();
    return { templates, count: templates.length };
  }
}
