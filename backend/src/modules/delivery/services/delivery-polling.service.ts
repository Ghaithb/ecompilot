import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shipment, ShipmentDocument } from '../schemas/shipment.schema';
import { isTerminalStatus } from '../utils/shipment-response.normalizer';
import { DeliveryService } from './delivery.service';

/**
 * Fallback polling — synchronise les expéditions sans webhook récent.
 * EcomPilot n'exécute pas la logistique : appels trackShipment provider uniquement.
 */
@Injectable()
export class DeliveryPollingService {
  private readonly logger = new Logger(DeliveryPollingService.name);
  private running = false;

  constructor(
    private config: ConfigService,
    private delivery: DeliveryService,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
  ) {}

  @Cron('0 */15 * * * *')
  async pollStaleShipments() {
    if (!this.config.get<boolean>('delivery.pollingEnabled')) return;
    if (this.running) return;

    this.running = true;
    const staleMinutes = this.config.get<number>('delivery.pollingStaleMinutes') || 120;
    const cutoff = new Date(Date.now() - staleMinutes * 60 * 1000);
    const batchSize = this.config.get<number>('delivery.pollingBatchSize') || 50;

    try {
      const candidates = await this.shipmentModel
        .find({
          status: {
            $nin: ['delivered', 'cancelled', 'refused', 'return_completed'],
          },
          $or: [
            { lastWebhookAt: { $exists: false } },
            { lastWebhookAt: null },
            { lastWebhookAt: { $lt: cutoff } },
          ],
        })
        .sort({ lastSyncedAt: 1 })
        .limit(batchSize);

      let synced = 0;
      for (const shipment of candidates) {
        if (isTerminalStatus(shipment.status)) continue;

        const tenantId = shipment.tenantId.toString();
        try {
          await this.delivery.syncTracking(tenantId, shipment._id.toString(), {
            source: 'polling',
          });
          synced += 1;
        } catch (error) {
          this.logger.warn(
            `Polling ${shipment.trackingNumber}: ${(error as Error).message}`,
          );
        }
      }

      if (synced > 0) {
        this.logger.log(`Polling livraison: ${synced}/${candidates.length} synchronisées`);
      }
    } finally {
      this.running = false;
    }
  }
}
