import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

/** Phase 3 — dual-write Mongo → Postgres (ORDERS_DUAL_WRITE=true). */
@Injectable()
export class PrismaMirrorService {
  private readonly logger = new Logger(PrismaMirrorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  isEnabled(): boolean {
    return this.config.get<string>('ORDERS_DUAL_WRITE') === 'true';
  }

  async mirrorMongoOrder(tenantId: string, order: Record<string, any>) {
    if (!this.isEnabled()) return null;

    try {
      const lineItems = (order.lineItems || []).map((item: Record<string, any>) => ({
        productId: item.productId?.toString?.() || item.productId,
        title: item.name || item.title || 'Produit',
        quantity: item.quantity || 1,
        unitPrice: Number(item.price ?? item.unitPrice ?? 0),
        total: Number(item.quantity || 1) * Number(item.price ?? item.unitPrice ?? 0),
      }));

      const subtotal = lineItems.reduce((s: number, i: { total: number }) => s + i.total, 0);
      const total = Number(order.total ?? subtotal);
      const orderNumber = order.orderNumber || `MONGO-${order._id}`;

      const existing = await this.prisma.order.findFirst({
        where: { tenantId, orderNumber },
        select: { id: true },
      });

      const baseData = {
        tenantId,
        orderNumber,
        customerEmail: order.customerEmail || order.shippingAddress?.email || 'cod@ecompilot.local',
        status: order.status || 'created',
        paymentStatus: order.paymentStatus || 'pending',
        paymentMethod: order.paymentMethod || 'cod',
        subtotal,
        taxAmount: Number(order.taxAmount ?? 0),
        shippingAmount: Number(order.shippingAmount ?? 0),
        discountAmount: Number(order.discountAmount ?? 0),
        total,
        currency: order.currency || 'TND',
        trackingNumber: order.trackingNumber ? String(order.trackingNumber) : undefined,
        shippingProvider: order.shippingProvider ? String(order.shippingProvider) : undefined,
        shippingAddress: (order.shippingAddress || {}) as Prisma.InputJsonValue,
        metadata: {
          mongoId: order._id?.toString?.() || order._id,
          codTrustScore: order.codTrustScore,
          codTrustLevel: order.codTrustLevel,
        } as Prisma.InputJsonValue,
      };

      if (existing) {
        return this.prisma.order.update({
          where: { id: existing.id },
          data: {
            status: baseData.status,
            paymentStatus: baseData.paymentStatus,
            total: baseData.total,
            trackingNumber: baseData.trackingNumber,
            shippingProvider: baseData.shippingProvider,
            metadata: baseData.metadata,
          },
        });
      }

      return this.prisma.order.create({
        data: {
          ...baseData,
          lineItems: { create: lineItems },
          statusEvents: {
            create: {
              fromStatus: null,
              toStatus: baseData.status,
              note: 'Dual-write depuis MongoDB',
            },
          },
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Dual-write order échoué pour ${order.orderNumber}: ${message}`);
      return null;
    }
  }

  async mirrorMongoCustomer(tenantId: string, customer: Record<string, any>) {
    if (!this.isEnabled()) return null;

    try {
      const email = String(customer.email || `guest-${customer._id}@local`);
      return this.prisma.customer.upsert({
        where: { tenantId_email: { tenantId, email } },
        create: {
          tenantId,
          email,
          firstName: String(customer.firstName || 'Client'),
          lastName: String(customer.lastName || ''),
          phone: customer.phone ? String(customer.phone) : undefined,
          status: String(customer.status || 'active'),
          tags: customer.tags || [],
          stats: customer.stats ?? {},
          mongoId: customer._id?.toString?.() || String(customer._id),
        },
        update: {
          firstName: String(customer.firstName || 'Client'),
          lastName: String(customer.lastName || ''),
          phone: customer.phone ? String(customer.phone) : undefined,
          status: String(customer.status || 'active'),
          tags: customer.tags || [],
          stats: customer.stats ?? {},
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Dual-write customer échoué: ${message}`);
      return null;
    }
  }

  async mirrorMongoShipment(tenantId: string, shipment: Record<string, any>) {
    if (!this.isEnabled()) return null;

    try {
      const trackingNumber = String(shipment.trackingNumber || `TMP-${shipment._id}`);
      return this.prisma.shipment.upsert({
        where: { tenantId_trackingNumber: { tenantId, trackingNumber } },
        create: {
          tenantId,
          mongoOrderId: shipment.orderId ? String(shipment.orderId) : undefined,
          orderNumber: shipment.orderNumber ? String(shipment.orderNumber) : undefined,
          provider: String(shipment.provider || 'unknown'),
          trackingNumber,
          status: String(shipment.status || 'created'),
          mock: Boolean(shipment.mock),
          metadata: { mongoId: shipment._id?.toString?.() || String(shipment._id) },
        },
        update: {
          status: String(shipment.status || 'created'),
          orderNumber: shipment.orderNumber ? String(shipment.orderNumber) : undefined,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Dual-write shipment échoué: ${message}`);
      return null;
    }
  }
}
