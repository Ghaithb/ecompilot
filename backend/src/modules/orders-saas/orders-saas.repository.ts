import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateOrderInput, ListOrdersQuery } from './schemas/order.zod';

const orderInclude = {
  lineItems: true,
  statusEvents: { orderBy: { createdAt: 'desc' as const }, take: 20 },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersSaasRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    orderNumber: string,
    input: CreateOrderInput,
    totals: { subtotal: number; total: number },
  ) {
    return this.prisma.withTenantScope(tenantId, () =>
      this.prisma.order.create({
        data: {
          tenantId,
          orderNumber,
          customerEmail: input.customerEmail,
          status: 'created',
          paymentMethod: input.paymentMethod,
          currency: input.currency,
          subtotal: totals.subtotal,
          taxAmount: input.taxAmount,
          shippingAmount: input.shippingAmount,
          discountAmount: input.discountAmount,
          total: totals.total,
          shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
          metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
          lineItems: {
            create: input.lineItems.map((item) => ({
              productId: item.productId,
              title: item.title,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
          statusEvents: {
            create: {
              fromStatus: null,
              toStatus: 'created',
              note: 'Commande créée',
            },
          },
        },
        include: orderInclude,
      }),
    );
  }

  async findMany(tenantId: string, query: ListOrdersQuery) {
    return this.prisma.withTenantScope(tenantId, async () => {
      const where: Prisma.OrderWhereInput = { tenantId };
      if (query.status) where.status = query.status;
      if (query.search?.trim()) {
        const q = query.search.trim();
        where.OR = [
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { customerEmail: { contains: q, mode: 'insensitive' } },
          { trackingNumber: { contains: q, mode: 'insensitive' } },
        ];
      }

      const skip = (query.page - 1) * query.limit;

      const [items, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        items,
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit) || 1,
      };
    });
  }

  async findById(tenantId: string, orderId: string) {
    return this.prisma.withTenantScope(tenantId, () =>
      this.prisma.order.findFirst({
        where: { id: orderId, tenantId },
        include: orderInclude,
      }),
    );
  }

  async updateStatus(
    tenantId: string,
    orderId: string,
    data: {
      status: string;
      changedBy?: string;
      note?: string;
      fromStatus: string;
    },
  ) {
    await this.assertTenantOrder(tenantId, orderId);
    return this.prisma.withTenantScope(tenantId, () =>
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: data.status,
          statusEvents: {
            create: {
              fromStatus: data.fromStatus,
              toStatus: data.status,
              changedBy: data.changedBy,
              note: data.note,
            },
          },
        },
        include: orderInclude,
      }),
    );
  }

  async linkShipment(
    tenantId: string,
    orderId: string,
    data: {
      shipmentId: string;
      trackingNumber?: string;
      shippingProvider?: string;
      status?: string;
      fromStatus?: string;
    },
  ) {
    await this.assertTenantOrder(tenantId, orderId);
    return this.prisma.withTenantScope(tenantId, () =>
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          shipmentId: data.shipmentId,
          trackingNumber: data.trackingNumber,
          shippingProvider: data.shippingProvider,
          ...(data.status ? { status: data.status } : {}),
          statusEvents: data.status
            ? {
                create: {
                  fromStatus: data.fromStatus ?? null,
                  toStatus: data.status,
                  note: `Lié à l'expédition ${data.shipmentId}`,
                },
              }
            : undefined,
        },
        include: orderInclude,
      }),
    );
  }

  private async assertTenantOrder(tenantId: string, orderId: string) {
    const row = await this.prisma.withTenantScope(tenantId, () =>
      this.prisma.order.findFirst({
        where: { id: orderId, tenantId },
        select: { id: true },
      }),
    );
    if (!row) {
      throw new NotFoundException('Commande introuvable');
    }
  }
}
