import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';
import { Shipment, ShipmentDocument } from '../schemas/shipment.schema';
import { mapProviderWebhookStatus } from '../webhooks/provider-status.mapper';

export type WebhookHandleResult =
  | { ok: true; shipmentId: string; status: string }
  | { ok: false; reason: string };

@Injectable()
export class DeliveryWebhookHandler {
  private readonly logger = new Logger(DeliveryWebhookHandler.name);

  constructor(
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
    private config: ConfigService,
  ) {}

  assertSecret(headerSecret?: string) {
    const expected = this.config.get<string>('delivery.webhookSecret');
    if (!expected) return;
    if (headerSecret !== expected) {
      throw new UnauthorizedException('Webhook secret invalide');
    }
  }

  async handle(
    provider: DeliveryProviderId,
    payload: Record<string, unknown>,
    options?: { tenantId?: string },
  ): Promise<WebhookHandleResult> {
    const trackingNumber = this.extractTracking(payload);
    if (!trackingNumber) {
      throw new BadRequestException('tracking_number manquant');
    }

    const rawStatus =
      (payload.status as string) ||
      (payload.state as string) ||
      (payload.event as string);

    const status = mapProviderWebhookStatus(provider, rawStatus);

    const query: Record<string, unknown> = { provider, trackingNumber };
    if (options?.tenantId) query.tenantId = options.tenantId;

    const shipment = await this.shipmentModel.findOne(query);
    if (!shipment) {
      this.logger.warn(`Webhook ${provider}: expédition ${trackingNumber} introuvable`);
      return { ok: false, reason: 'expédition introuvable' };
    }

    shipment.status = status;
    shipment.lastWebhookAt = new Date();
    shipment.rawResponse = payload as Record<string, unknown>;
    shipment.trackingHistory.push({
      status,
      description: `Webhook ${provider}${rawStatus ? `: ${rawStatus}` : ''}`,
      occurredAt: new Date(),
    });
    await shipment.save();

    this.logger.log(`Webhook ${provider} → ${trackingNumber} = ${status}`);
    return { ok: true, shipmentId: shipment._id.toString(), status };
  }

  private extractTracking(payload: Record<string, unknown>): string | undefined {
    const candidates = [
      payload.trackingNumber,
      payload.tracking_number,
      payload.barCode,
      payload.barcode,
      payload.id,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
    }
    const nested = payload.data as Record<string, unknown> | undefined;
    if (nested) return this.extractTracking(nested);
    return undefined;
  }
}
