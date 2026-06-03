import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvents } from '../../../core/events/domain-events.constants';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import { DeliveryProviderId, MVP_DELIVERY_PROVIDERS } from '../enums/delivery-provider.enum';
import {
  DeliveryOrderContext,
  DeliveryProvider,
} from '../interfaces/delivery-provider.interface';
import { Shipment, ShipmentDocument } from '../schemas/shipment.schema';
import { withRetry } from '../utils/retry.util';
import {
  normalizeShipmentResult,
  normalizeTrackingResult,
  toPublicShipment,
} from '../utils/shipment-response.normalizer';
import { DeliveryQueuePayload } from '../constants/delivery-queue.constants';
import { DeliveryProviderRegistry } from './delivery-provider-registry.service';
import { DeliveryQueueService } from '../queue/delivery-queue.service';

/**
 * Orchestrateur central : création expédition, retry HTTP, sync tracking, comparaison tarifs.
 */
@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private registry: DeliveryProviderRegistry,
    private queue: DeliveryQueueService,
    private events: EventBusService,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  provider(id: DeliveryProviderId): DeliveryProvider {
    return this.registry.get(id);
  }

  async listShipments(tenantId: string, filters?: { status?: string; provider?: string }) {
    const q: Record<string, unknown> = { tenantId };
    if (filters?.status) q.status = filters.status;
    if (filters?.provider) q.provider = filters.provider;
    return this.shipmentModel.find(q).sort({ createdAt: -1 }).limit(200).lean();
  }

  async listShipmentsPublic(tenantId: string, filters?: { status?: string; provider?: string }) {
    const rows = await this.listShipments(tenantId, filters);
    return rows.map((row) => toPublicShipment(row as Record<string, unknown>));
  }

  async getShipment(tenantId: string, shipmentId: string) {
    const shipment = await this.shipmentModel.findOne({ _id: shipmentId, tenantId }).lean();
    if (!shipment) throw new BadRequestException('Expédition introuvable');
    return shipment;
  }

  async getShipmentPublic(tenantId: string, shipmentId: string) {
    const shipment = await this.getShipment(tenantId, shipmentId);
    return toPublicShipment(shipment as Record<string, unknown>);
  }

  async trackByTrackingNumber(tenantId: string, trackingNumber: string) {
    const shipment = await this.shipmentModel.findOne({ tenantId, trackingNumber });
    if (!shipment) throw new BadRequestException('Expédition introuvable');

    const result = await this.syncTracking(tenantId, shipment._id.toString(), {
      source: 'api',
    });
    return toPublicShipment(result.shipment as unknown as Record<string, unknown>);
  }

  async getShipmentStats(tenantId: string) {
    const base = { tenantId };
    const [total, delivered, inTransit, refused] = await Promise.all([
      this.shipmentModel.countDocuments(base),
      this.shipmentModel.countDocuments({ ...base, status: 'delivered' }),
      this.shipmentModel.countDocuments({
        ...base,
        status: { $in: ['in_transit', 'out_for_delivery', 'created'] },
      }),
      this.shipmentModel.countDocuments({ ...base, status: 'refused' }),
    ]);
    return {
      total,
      delivered,
      inTransit,
      refused,
      successRate: total ? Math.round((delivered / total) * 100) : 0,
    };
  }

  async createFromOrder(
    tenantId: string,
    orderId: string,
    providerId: DeliveryProviderId,
    options?: { weightKg?: number; localityId?: number; async?: boolean },
  ) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');

    const configured = await this.registry.get(providerId).isConfigured(tenantId);
    if (!configured) {
      throw new BadRequestException(
        `Aucune clé API pour ${providerId}. Ajoutez un token dans Paramètres livraison.`,
      );
    }

    if (options?.async !== false && this.queue.isEnabled()) {
      await this.queue.enqueueCreate({
        tenantId,
        orderId,
        providerId,
        weightKg: options?.weightKg,
        localityId: options?.localityId,
      });
      return { queued: true, message: "Expédition en file d'attente" };
    }

    const ctx = this.mapOrder(order, options);
    return this.executeCreate(tenantId, order, ctx, providerId);
  }

  /** Appelé par le processor Bull. */
  async processQueuedCreate(payload: DeliveryQueuePayload) {
    const order = await this.orderModel.findOne({
      _id: payload.orderId,
      tenantId: payload.tenantId,
    });
    if (!order) {
      this.logger.warn(`Order ${payload.orderId} introuvable (job delivery)`);
      return;
    }
    const ctx = this.mapOrder(order, {
      weightKg: payload.weightKg,
      localityId: payload.localityId,
    });
    return this.executeCreate(
      payload.tenantId,
      order,
      ctx,
      payload.providerId as DeliveryProviderId,
    );
  }

  async executeCreate(
    tenantId: string,
    order: OrderDocument,
    ctx: DeliveryOrderContext,
    providerId: DeliveryProviderId,
  ) {
    const provider = this.registry.get(providerId);
    const result = await withRetry(() => provider.createOrder(ctx), { maxAttempts: 3 });
    const normalized = normalizeShipmentResult(providerId, result);

    const shipment = await this.shipmentModel.create({
      tenantId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      provider: providerId,
      trackingNumber: normalized.trackingNumber,
      providerRef: normalized.providerRef,
      labelUrl: normalized.labelUrl,
      status: normalized.status,
      localityId: ctx.localityId,
      mock: normalized.mock,
      rawResponse: this.toRawRecord(normalized.rawResponse),
      trackingHistory: [{ status: normalized.status, occurredAt: new Date() }],
    });

    order.trackingNumber = result.trackingNumber;
    order.shippingProvider = providerId;
    order.labelUrl = result.labelUrl;
    order.providerRef = result.providerRef;
    await order.save();


    this.logger.log(`Shipment ${result.trackingNumber} (${providerId}) #${order.orderNumber}`);
    this.events.publishSync(DomainEvents.SHIPMENT_CREATED, {
      tenantId,
      shipmentId: shipment._id.toString(),
      orderId: order._id.toString(),
      provider: providerId,
      trackingNumber: normalized.trackingNumber,
    });
    return {
      shipment: toPublicShipment(shipment.toObject() as unknown as Record<string, unknown>),
      result: normalized,
    };
  }

  async syncTracking(
    tenantId: string,
    shipmentId: string,
    options?: { source?: 'manual' | 'polling' | 'api' | 'webhook' },
  ) {
    const shipment = await this.shipmentModel.findOne({ _id: shipmentId, tenantId });
    if (!shipment) throw new BadRequestException('Expédition introuvable');

    const provider = this.registry.get(shipment.provider as DeliveryProviderId);
    const tracking = await withRetry(() =>
      provider.trackOrder(shipment.trackingNumber, tenantId),
    );
    const normalized = normalizeTrackingResult(tracking);

    shipment.status = normalized.status;
    shipment.rawResponse = this.toRawRecord(normalized.rawResponse);
    shipment.lastSyncedAt = new Date();
    shipment.trackingHistory.push({
      status: normalized.status,
      location: normalized.location,
      description:
        options?.source === 'polling'
          ? 'Sync automatique (polling)'
          : options?.source === 'webhook'
            ? 'Webhook transporteur'
            : undefined,
      occurredAt: tracking.updatedAt || new Date(),
    });
    await shipment.save();


    return { shipment: shipment.toObject(), tracking: normalized };
  }

  async cancelShipment(tenantId: string, shipmentId: string) {
    const shipment = await this.shipmentModel.findOne({ _id: shipmentId, tenantId });
    if (!shipment) throw new BadRequestException('Expédition introuvable');
    if (shipment.status === 'delivered') {
      throw new BadRequestException('Impossible d\'annuler une expédition déjà livrée');
    }
    if (shipment.status === 'cancelled') {
      return { shipment, cancelled: true, providerCancelled: false };
    }

    const provider = this.registry.get(shipment.provider as DeliveryProviderId);
    let providerCancelled = false;
    try {
      providerCancelled = await withRetry(() =>
        provider.cancelOrder(shipment.trackingNumber, tenantId),
      );
    } catch (error) {
      this.logger.warn(
        `Annulation provider échouée ${shipment.trackingNumber}: ${(error as Error).message}`,
      );
    }

    shipment.status = 'cancelled';
    shipment.trackingHistory.push({
      status: 'cancelled',
      description: providerCancelled
        ? 'Annulé chez le transporteur'
        : 'Annulé localement (transporteur non confirmé)',
      occurredAt: new Date(),
    });
    await shipment.save();


    return { shipment, cancelled: true, providerCancelled };
  }

  async testProviderConnection(tenantId: string, providerId: DeliveryProviderId) {
    const provider = this.registry.get(providerId);
    const configured = await provider.isConfigured(tenantId);
    if (!configured) {
      return {
        ok: false,
        provider: providerId,
        message: 'Aucune clé API configurée pour cette boutique',
      };
    }

    try {
      if (providerId === DeliveryProviderId.FIRST_DELIVERY) {
        const fd = this.registry.getFirstDelivery();
        const localities = await fd.getLocalities(tenantId);
        return {
          ok: true,
          provider: providerId,
          message: `Connexion OK (${localities.length} localités)`,
        };
      }

      if (provider.getRates) {
        const sample: DeliveryOrderContext = {
          orderId: 'test',
          orderNumber: 'TEST-CONN',
          tenantId,
          customerName: 'Test',
          customerPhone: '20000000',
          address: 'Tunis',
          city: 'Tunis',
          province: 'Tunis',
          country: 'TN',
          weightKg: 1,
          codAmount: 50,
          currency: 'TND',
          total: 50,
          lineItems: [{ title: 'Test', quantity: 1, price: 50 }],
        };
        await provider.getRates(sample);
        return { ok: true, provider: providerId, message: 'Connexion API validée' };
      }

      return { ok: true, provider: providerId, message: 'Clé API enregistrée' };
    } catch (error) {
      return {
        ok: false,
        provider: providerId,
        message: (error as Error).message || 'Échec du test de connexion',
      };
    }
  }

  async compareRates(tenantId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');
    const ctx = this.mapOrder(order);

    const rates = await Promise.all(
      MVP_DELIVERY_PROVIDERS.map(async (id) => {
        const p = this.registry.get(id);
        if (!p.getRates) return null;
        if (!(await p.isConfigured(tenantId))) return null;
        try {
          const r = await p.getRates(ctx);
          return { provider: id, ...r };
        } catch {
          return null;
        }
      }),
    );

    return rates.filter(Boolean);
  }

  /** Devis livraison pré-checkout (sans commande existante). */
  async quoteCheckoutRates(tenantId: string, ctx: DeliveryOrderContext) {
    const rates = await Promise.all(
      MVP_DELIVERY_PROVIDERS.map(async (id) => {
        const p = this.registry.get(id);
        if (!p.getRates) return null;
        if (!(await p.isConfigured(tenantId))) return null;
        try {
          const r = await p.getRates(ctx);
          return {
            provider: id,
            rate: r.rate,
            currency: r.currency || 'TND',
            estimatedDays: r.estimatedDays || 2,
          };
        } catch {
          return null;
        }
      }),
    );

    const valid = rates.filter(Boolean) as Array<{
      provider: DeliveryProviderId;
      rate: number;
      currency: string;
      estimatedDays: number;
    }>;

    if (valid.length === 0) {
      const fallback = {
        provider: DeliveryProviderId.FIRST_DELIVERY,
        rate: 7,
        currency: 'TND',
        estimatedDays: 2,
      };
      return { rates: [fallback], best: fallback };
    }

    const best = [...valid].sort((a, b) => a.rate - b.rate)[0];
    return { rates: valid, best };
  }

  private mapOrder(
    order: OrderDocument,
    options?: { weightKg?: number; localityId?: number },
  ): DeliveryOrderContext {
    const addr = order.shippingAddress;
    const lineItems = (order.lineItems || []).map((i) => ({
      title: i.title,
      quantity: i.quantity,
      price: i.price,
    }));
    const qty = lineItems.reduce((s, i) => s + i.quantity, 0) || 1;

    return {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      tenantId: order.tenantId.toString(),
      customerName: addr ? `${addr.firstName} ${addr.lastName}`.trim() : order.customerEmail,
      customerPhone: addr?.phone || '',
      customerEmail: order.customerEmail,
      address: addr?.address1 || '',
      city: addr?.city || 'Tunis',
      province: addr?.province || 'Tunis',
      country: addr?.country || 'TN',
      weightKg: options?.weightKg ?? Math.max(0.5, qty * 0.3),
      codAmount: order.paymentMethod === 'cod' ? order.total : undefined,
      currency: order.currency || 'TND',
      total: order.total,
      lineItems,
      localityId: options?.localityId,
    };
  }

  private toRawRecord(raw: unknown): Record<string, unknown> | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    return { value: raw };
  }
}
