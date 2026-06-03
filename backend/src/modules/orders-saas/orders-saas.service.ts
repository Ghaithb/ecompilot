import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderStatusService } from '../orders/order-status.service';
import { OrdersSaasRepository } from './orders-saas.repository';
import type {
  CreateOrderInput,
  LinkShipmentInput,
  ListOrdersQuery,
  UpdateOrderStatusInput,
} from './schemas/order.zod';

@Injectable()
export class OrdersSaasService {
  constructor(
    private readonly repo: OrdersSaasRepository,
    private readonly statusLifecycle: OrderStatusService,
  ) {}

  async create(tenantId: string, input: CreateOrderInput) {
    const subtotal = input.lineItems.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );
    const total =
      subtotal + input.shippingAmount + input.taxAmount - input.discountAmount;

    const orderNumber = await this.generateOrderNumber(tenantId);

    const order = await this.repo.create(tenantId, orderNumber, input, {
      subtotal,
      total,
    });

    return this.serializeOrder(order);
  }

  async list(tenantId: string, query: ListOrdersQuery) {
    const result = await this.repo.findMany(tenantId, query);
    return {
      ...result,
      items: result.items.map((o) => this.serializeOrder(o)),
    };
  }

  async getById(tenantId: string, orderId: string) {
    const order = await this.repo.findById(tenantId, orderId);
    if (!order) throw new NotFoundException('Commande introuvable');
    return this.serializeOrder(order);
  }

  async updateStatus(
    tenantId: string,
    orderId: string,
    input: UpdateOrderStatusInput,
    actor?: { id?: string; roles?: string[] },
  ) {
    const order = await this.repo.findById(tenantId, orderId);
    if (!order) throw new NotFoundException('Commande introuvable');

    const next = this.statusLifecycle.assertTransition(
      order.status,
      input.status,
      actor?.roles ?? [],
    );

    const updated = await this.repo.updateStatus(tenantId, orderId, {
      status: next,
      fromStatus: order.status,
      changedBy: actor?.id,
      note: input.note,
    });

    return this.serializeOrder(updated);
  }

  listNextStatuses(currentStatus: string) {
    return this.statusLifecycle.listNextStatuses(currentStatus);
  }

  async linkShipment(
    tenantId: string,
    orderId: string,
    input: LinkShipmentInput,
    actor?: { id?: string; roles?: string[] },
  ) {
    const order = await this.repo.findById(tenantId, orderId);
    if (!order) throw new NotFoundException('Commande introuvable');

    let newStatus: string | undefined;
    if (input.markShipped && order.status !== OrderStatus.SHIPPED) {
      if (this.statusLifecycle.canTransition(order.status, OrderStatus.SHIPPED)) {
        this.statusLifecycle.assertTransition(
          order.status,
          OrderStatus.SHIPPED,
          actor?.roles ?? ['merchant', 'admin'],
        );
        newStatus = OrderStatus.SHIPPED;
      }
    }

    const updated = await this.repo.linkShipment(tenantId, orderId, {
      shipmentId: input.shipmentId,
      trackingNumber: input.trackingNumber,
      shippingProvider: input.shippingProvider,
      status: newStatus,
      fromStatus: order.status,
    });

    return this.serializeOrder(updated);
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const suffix = Date.now().toString(36).toUpperCase();
    const shortTenant = tenantId.replace(/\W/g, '').slice(-6).toUpperCase() || 'T';
    return `ORD-${shortTenant}-${suffix}`;
  }

  private serializeOrder(order: any) {
    const toNum = (v: unknown) =>
      typeof v === 'object' && v !== null && 'toNumber' in v
        ? (v as { toNumber: () => number }).toNumber()
        : Number(v);

    const lineItems = Array.isArray(order.lineItems)
      ? (order.lineItems as Array<Record<string, unknown>>).map((li) => ({
          ...li,
          unitPrice: toNum(li.unitPrice),
          total: toNum(li.total),
        }))
      : order.lineItems;

    return {
      ...order,
      subtotal: toNum(order.subtotal),
      taxAmount: toNum(order.taxAmount),
      shippingAmount: toNum(order.shippingAmount),
      discountAmount: toNum(order.discountAmount),
      total: toNum(order.total),
      lineItems,
    };
  }
}
