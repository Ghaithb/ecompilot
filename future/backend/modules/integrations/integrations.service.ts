import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Integration, IntegrationDocument, IntegrationProvider, IntegrationStatus } from './schemas/integration.schema';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectModel(Integration.name) private integrationModel: Model<IntegrationDocument>,
  ) {}

  async listIntegrations(tenantId: string) {
    const integrations = await this.integrationModel
      .find({ tenantId, isActive: true })
      .select('-credentials') // Ne pas exposer les credentials
      .lean()
      .exec();

    return {
      integrations,
      count: integrations.length,
      available: Object.values(IntegrationProvider),
    };
  }

  async getIntegration(tenantId: string, provider: IntegrationProvider) {
    const integration = await this.integrationModel
      .findOne({ tenantId, provider })
      .select('-credentials')
      .lean()
      .exec();

    if (!integration) {
      throw new NotFoundException(`Integration ${provider} not found`);
    }

    return integration;
  }

  async createIntegration(tenantId: string, provider: IntegrationProvider, data: any) {
    const existing = await this.integrationModel.findOne({ tenantId, provider });
    
    if (existing) {
      // Update existing
      return this.integrationModel.findByIdAndUpdate(
        existing._id,
        {
          ...data,
          status: IntegrationStatus.ACTIVE,
          connectedAt: new Date(),
          isActive: true,
        },
        { new: true },
      );
    }

    // Create new
    const integration = new this.integrationModel({
      tenantId,
      provider,
      ...data,
      status: IntegrationStatus.ACTIVE,
      connectedAt: new Date(),
      isActive: true,
    });

    return integration.save();
  }

  async disconnectIntegration(tenantId: string, provider: IntegrationProvider) {
    const integration = await this.integrationModel.findOne({ tenantId, provider });

    if (!integration) {
      throw new NotFoundException(`Integration ${provider} not found`);
    }

    integration.status = IntegrationStatus.INACTIVE;
    integration.isActive = false;
    integration.disconnectedAt = new Date();

    return integration.save();
  }

  async handleShopifyWebhook(payload: any, hmac: string) {
    // TODO: Validate HMAC and process Shopify webhook
    // const isValid = this.validateShopifyHmac(payload, hmac);
    // if (!isValid) throw new BadRequestException('Invalid HMAC');
    
    return { ok: true, message: 'Webhook received' };
  }

  async handleWooWebhook(payload: any, signature: string) {
    // TODO: Validate signature and process WooCommerce webhook
    // const isValid = this.validateWooSignature(payload, signature);
    // if (!isValid) throw new BadRequestException('Invalid signature');
    
    return { ok: true, message: 'Webhook received' };
  }

  async getIntegrationStatus(tenantId: string, provider: IntegrationProvider) {
    const integration = await this.integrationModel
      .findOne({ tenantId, provider })
      .select('status isActive connectedAt lastUsedAt metadata')
      .lean()
      .exec();

    if (!integration) {
      return {
        provider,
        connected: false,
        status: IntegrationStatus.INACTIVE,
      };
    }

    return {
      provider,
      connected: integration.isActive,
      status: integration.status,
      connectedAt: integration.connectedAt,
      lastUsedAt: integration.lastUsedAt,
      lastSync: integration.metadata?.lastSync,
    };
  }
}
