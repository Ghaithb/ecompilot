import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from '../../tenants/schemas/tenant.schema';

@Injectable()
export class LinkedInAdsService {
  private readonly logger = new Logger(LinkedInAdsService.name);
  private clientId: string;
  private clientSecret: string;
  private isConfigured: boolean;

  constructor(
    private configService: ConfigService,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
  ) {
    this.clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
    this.isConfigured = !!(this.clientId && this.clientSecret);
  }

  /**
   * Récupère tous les comptes publicitaires LinkedIn
   */
  async getAdAccounts(tenantId: string) {
    try {
      const tenant = await this.tenantModel.findById(tenantId);
      
      if (!tenant?.integrations?.linkedin?.accessTokenEnc) {
        throw new Error('LinkedIn non connecté');
      }

      const accessToken = tenant.integrations.linkedin.accessTokenEnc;

      const response = await fetch(
        `https://api.linkedin.com/v2/adAccountsV2?q=search&` +
        `projection=(elements*(id,name,status,currency,totalBudget))`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API LinkedIn');
      }

      const data = await response.json();

      return {
        accounts: data.elements || [],
        count: data.elements?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Erreur récupération comptes LinkedIn Ads: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les campagnes LinkedIn
   */
  async getCampaigns(tenantId: string, accountId: string) {
    try {
      const tenant = await this.tenantModel.findById(tenantId);
      
      if (!tenant?.integrations?.linkedin?.accessTokenEnc) {
        throw new Error('LinkedIn non connecté');
      }

      const accessToken = tenant.integrations.linkedin.accessTokenEnc;

      const response = await fetch(
        `https://api.linkedin.com/v2/adCampaignsV2?q=search&` +
        `search=(account:(values:List(urn%3Ali%3AsponsoredAccount%3A${accountId})))&` +
        `projection=(elements*(id,name,status,type,dailyBudget,totalBudget,runSchedule))`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API LinkedIn');
      }

      const data = await response.json();

      return {
        campaigns: data.elements || [],
        count: data.elements?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Erreur récupération campagnes LinkedIn: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'une campagne LinkedIn
   */
  async getCampaignInsights(tenantId: string, campaignId: string, startDate?: string, endDate?: string) {
    try {
      const tenant = await this.tenantModel.findById(tenantId);
      
      if (!tenant?.integrations?.linkedin?.accessTokenEnc) {
        throw new Error('LinkedIn non connecté');
      }

      const accessToken = tenant.integrations.linkedin.accessTokenEnc;

      // Dates par défaut: 30 derniers jours
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await fetch(
        `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&` +
        `pivot=CAMPAIGN&` +
        `dateRange=(start:(year:${start.split('-')[0]},month:${parseInt(start.split('-')[1])},day:${parseInt(start.split('-')[2])}),` +
        `end:(year:${end.split('-')[0]},month:${parseInt(end.split('-')[1])},day:${parseInt(end.split('-')[2])}))&` +
        `campaigns=List(urn:li:sponsoredCampaign:${campaignId})&` +
        `fields=impressions,clicks,costInLocalCurrency,externalWebsiteConversions,externalWebsitePostClickConversions,` +
        `externalWebsitePostViewConversions,conversionValueInLocalCurrency`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API LinkedIn');
      }

      const data = await response.json();
      const insights = data.elements?.[0] || {};

      // Calculer les métriques
      const spend = parseFloat(insights.costInLocalCurrency || 0);
      const conversions = parseInt(insights.externalWebsiteConversions || 0);
      const revenue = parseFloat(insights.conversionValueInLocalCurrency || 0);
      const impressions = parseInt(insights.impressions || 0);
      const clicks = parseInt(insights.clicks || 0);
      const cpc = clicks > 0 ? spend / clicks : 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

      return {
        ...insights,
        spend,
        conversions,
        revenue,
        cpc: cpc.toFixed(2),
        ctr: ctr.toFixed(2),
        roi: roi.toFixed(2),
        roas: spend > 0 ? (revenue / spend).toFixed(2) : 0,
      };
    } catch (error) {
      this.logger.error(`Erreur récupération insights LinkedIn: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de toutes les campagnes LinkedIn
   */
  async getAllCampaignsInsights(tenantId: string, accountId: string, startDate?: string, endDate?: string) {
    try {
      const tenant = await this.tenantModel.findById(tenantId);
      
      if (!tenant?.integrations?.linkedin?.accessTokenEnc) {
        throw new Error('LinkedIn non connecté');
      }

      const accessToken = tenant.integrations.linkedin.accessTokenEnc;

      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await fetch(
        `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&` +
        `pivot=CAMPAIGN&` +
        `dateRange=(start:(year:${start.split('-')[0]},month:${parseInt(start.split('-')[1])},day:${parseInt(start.split('-')[2])}),` +
        `end:(year:${end.split('-')[0]},month:${parseInt(end.split('-')[1])},day:${parseInt(end.split('-')[2])}))&` +
        `accounts=List(urn:li:sponsoredAccount:${accountId})&` +
        `fields=impressions,clicks,costInLocalCurrency,externalWebsiteConversions,conversionValueInLocalCurrency`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API LinkedIn');
      }

      const data = await response.json();

      const enrichedCampaigns = (data.elements || []).map(campaign => {
        const spend = parseFloat(campaign.costInLocalCurrency || 0);
        const conversions = parseInt(campaign.externalWebsiteConversions || 0);
        const revenue = parseFloat(campaign.conversionValueInLocalCurrency || 0);
        const impressions = parseInt(campaign.impressions || 0);
        const clicks = parseInt(campaign.clicks || 0);
        const cpc = clicks > 0 ? spend / clicks : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

        return {
          ...campaign,
          spend,
          conversions,
          revenue,
          cpc: cpc.toFixed(2),
          ctr: ctr.toFixed(2),
          roi: roi.toFixed(2),
          roas: spend > 0 ? (revenue / spend).toFixed(2) : 0,
        };
      });

      const totals = this.calculateTotals(enrichedCampaigns);

      return {
        campaigns: enrichedCampaigns,
        count: enrichedCampaigns.length,
        totals,
      };
    } catch (error) {
      this.logger.error(`Erreur récupération insights LinkedIn: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les publicités LinkedIn d'une campagne
   */
  async getAds(tenantId: string, campaignId: string) {
    try {
      const tenant = await this.tenantModel.findById(tenantId);
      
      if (!tenant?.integrations?.linkedin?.accessTokenEnc) {
        throw new Error('LinkedIn non connecté');
      }

      const accessToken = tenant.integrations.linkedin.accessTokenEnc;

      const response = await fetch(
        `https://api.linkedin.com/v2/adCreativesV2?q=search&` +
        `search=(campaign:(values:List(urn%3Ali%3AsponsoredCampaign%3A${campaignId})))&` +
        `projection=(elements*(id,name,status,type,content))`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API LinkedIn');
      }

      const data = await response.json();

      return {
        ads: data.elements || [],
        count: data.elements?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Erreur récupération publicités LinkedIn: ${error.message}`);
      throw error;
    }
  }

  /**
   * Dashboard complet LinkedIn Ads
   */
  async getAdsDashboard(tenantId: string, accountId: string) {
    try {
      const [accounts, campaigns, insights] = await Promise.all([
        this.getAdAccounts(tenantId),
        this.getCampaigns(tenantId, accountId),
        this.getAllCampaignsInsights(tenantId, accountId),
      ]);

      return {
        account: accounts.accounts.find(acc => acc.id === accountId),
        campaigns: campaigns.campaigns,
        insights: insights.campaigns,
        totals: insights.totals,
        platform: 'LinkedIn',
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Erreur dashboard LinkedIn Ads: ${error.message}`);
      throw error;
    }
  }

  private calculateTotals(campaigns: any[]) {
    return campaigns.reduce((totals, campaign) => ({
      impressions: totals.impressions + parseInt(campaign.impressions || 0),
      clicks: totals.clicks + parseInt(campaign.clicks || 0),
      spend: totals.spend + parseFloat(campaign.spend || 0),
      conversions: totals.conversions + parseInt(campaign.conversions || 0),
      revenue: totals.revenue + parseFloat(campaign.revenue || 0),
    }), {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      revenue: 0,
    });
  }
}
