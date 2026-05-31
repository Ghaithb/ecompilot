import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { AppRole } from '../../common/enums/app-role.enum';

/** Statuts considérés comme « COD encaissé par le livreur ». */
const COLLECTED_STATUSES = [
  OrderStatus.DELIVERED,
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
];

/** Statuts « colis en main du livreur » pour le bordereau (manifest). */
const ACTIVE_DELIVERY_STATUSES = [
  OrderStatus.ASSIGNED_TO_DRIVER,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.SHIPPED,
];

type ReconciliationRow = {
  driverId: string;
  pendingAmount: number;
  pendingCount: number;
  settledAmount: number;
  settledCount: number;
};

@Injectable()
export class DriverReconciliationService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Vue d'ensemble : pour chaque livreur, le cash COD encaissé mais non
   * encore remis (ce qu'il te doit) et l'historique déjà réglé.
   */
  async getReconciliationSummary(tenantId: string) {
    const tenant = new Types.ObjectId(tenantId);

    const rows = await this.orderModel.aggregate<ReconciliationRow>([
      {
        $match: {
          tenantId: tenant,
          paymentMethod: 'cod',
          status: { $in: COLLECTED_STATUSES },
          assignedDriverId: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedDriverId',
          pendingAmount: {
            $sum: {
              $cond: [
                { $ifNull: ['$codRemittedAt', false] },
                0,
                { $ifNull: ['$amountToCollect', '$total'] },
              ],
            },
          },
          pendingCount: {
            $sum: { $cond: [{ $ifNull: ['$codRemittedAt', false] }, 0, 1] },
          },
          settledAmount: {
            $sum: {
              $cond: [
                { $ifNull: ['$codRemittedAt', false] },
                { $ifNull: ['$amountToCollect', '$total'] },
                0,
              ],
            },
          },
          settledCount: {
            $sum: { $cond: [{ $ifNull: ['$codRemittedAt', false] }, 1, 0] },
          },
        },
      },
    ]);

    const byDriver = new Map(rows.map((r) => [String((r as any)._id), r]));

    const drivers = await this.userModel
      .find({ tenantId, roles: { $in: [AppRole.DRIVER] } })
      .select('firstName lastName phone isActive')
      .lean();

    const items = drivers.map((d) => {
      const stats = byDriver.get(String(d._id));
      return {
        driverId: String(d._id),
        name: `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || 'Livreur',
        phone: d.phone ?? null,
        isActive: d.isActive ?? true,
        pendingAmount: round(stats?.pendingAmount ?? 0),
        pendingCount: stats?.pendingCount ?? 0,
        settledAmount: round(stats?.settledAmount ?? 0),
        settledCount: stats?.settledCount ?? 0,
      };
    });

    items.sort((a, b) => b.pendingAmount - a.pendingAmount);

    const totalPending = round(items.reduce((s, i) => s + i.pendingAmount, 0));
    const totalPendingCount = items.reduce((s, i) => s + i.pendingCount, 0);

    return {
      summary: {
        totalToCollect: totalPending,
        ordersPending: totalPendingCount,
        driversWithCash: items.filter((i) => i.pendingAmount > 0).length,
      },
      drivers: items,
      updatedAt: new Date().toISOString(),
    };
  }

  /** Détail d'un livreur : commandes COD en attente de remise + déjà réglées. */
  async getDriverReconciliation(tenantId: string, driverId: string) {
    this.assertObjectId(driverId);
    const base = {
      tenantId: new Types.ObjectId(tenantId),
      assignedDriverId: new Types.ObjectId(driverId),
      paymentMethod: 'cod',
      status: { $in: COLLECTED_STATUSES },
    };

    const [pending, settled] = await Promise.all([
      this.orderModel
        .find({ ...base, codRemittedAt: { $in: [null, undefined] } })
        .select('orderNumber total amountToCollect customerEmail shippingAddress createdAt status')
        .sort({ createdAt: 1 })
        .lean(),
      this.orderModel
        .find({ ...base, codRemittedAt: { $ne: null } })
        .select('orderNumber total amountToCollect codRemittedAt')
        .sort({ codRemittedAt: -1 })
        .limit(50)
        .lean(),
    ]);

    const pendingAmount = round(
      pending.reduce((s, o) => s + (o.amountToCollect ?? o.total ?? 0), 0),
    );

    return {
      driverId,
      pending: {
        amount: pendingAmount,
        count: pending.length,
        orders: pending.map((o) => ({
          orderId: String(o._id),
          orderNumber: o.orderNumber,
          customerName: this.customerName(o),
          amount: round(o.amountToCollect ?? o.total ?? 0),
          deliveredAt: (o as any).updatedAt ?? o.createdAt,
        })),
      },
      settledRecent: settled.map((o) => ({
        orderId: String(o._id),
        orderNumber: o.orderNumber,
        amount: round(o.amountToCollect ?? o.total ?? 0),
        remittedAt: o.codRemittedAt,
      })),
    };
  }

  /**
   * Enregistre la remise du cash : marque les commandes COD livrées comme
   * réglées. Sans `orderIds`, règle tout le pending du livreur.
   */
  async settleDriver(
    tenantId: string,
    driverId: string,
    merchantId: string,
    orderIds?: string[],
  ) {
    this.assertObjectId(driverId);
    const filter: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      assignedDriverId: new Types.ObjectId(driverId),
      paymentMethod: 'cod',
      status: { $in: COLLECTED_STATUSES },
      codRemittedAt: { $in: [null, undefined] },
    };

    if (orderIds?.length) {
      filter._id = { $in: orderIds.map((id) => new Types.ObjectId(id)) };
    }

    const toSettle = await this.orderModel
      .find(filter)
      .select('amountToCollect total')
      .lean();

    if (!toSettle.length) {
      throw new BadRequestException('Aucune commande COD à régler pour ce livreur');
    }

    const settledAmount = round(
      toSettle.reduce((s, o) => s + (o.amountToCollect ?? o.total ?? 0), 0),
    );

    await this.orderModel.updateMany(filter, {
      $set: {
        codRemittedAt: new Date(),
        codRemittedBy: new Types.ObjectId(merchantId),
      },
    });

    return {
      settledCount: toSettle.length,
      settledAmount,
      remittedAt: new Date().toISOString(),
    };
  }

  /**
   * Bordereau d'enlèvement (manifest) : la liste des colis actuellement en
   * main du livreur, à imprimer pour la remise / tournée.
   */
  async getDriverManifest(tenantId: string, driverId: string) {
    this.assertObjectId(driverId);
    const driver = await this.userModel
      .findOne({ _id: driverId, tenantId, roles: { $in: [AppRole.DRIVER] } })
      .select('firstName lastName phone')
      .lean();
    if (!driver) throw new BadRequestException('Livreur introuvable');

    const orders = await this.orderModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        assignedDriverId: new Types.ObjectId(driverId),
        status: { $in: ACTIVE_DELIVERY_STATUSES },
      })
      .select('orderNumber total amountToCollect paymentMethod shippingAddress delegation status createdAt')
      .sort({ createdAt: 1 })
      .lean();

    const items = orders.map((o) => {
      const isCod = o.paymentMethod === 'cod';
      return {
        orderNumber: o.orderNumber,
        customerName: this.customerName(o),
        phone: o.shippingAddress?.phone ?? null,
        address: this.addressLine(o),
        region: o.shippingAddress?.province ?? o.delegation ?? null,
        codAmount: isCod ? round(o.amountToCollect ?? o.total ?? 0) : 0,
        isCod,
      };
    });

    const codTotal = round(items.reduce((s, i) => s + i.codAmount, 0));

    return {
      driver: {
        id: String(driver._id),
        name: `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() || 'Livreur',
        phone: driver.phone ?? null,
      },
      generatedAt: new Date().toISOString(),
      summary: {
        parcels: items.length,
        codParcels: items.filter((i) => i.isCod).length,
        codTotal,
      },
      items,
    };
  }

  private customerName(o: Partial<Order>): string {
    const a = (o as Order).shippingAddress;
    const name = `${a?.firstName ?? ''} ${a?.lastName ?? ''}`.trim();
    return name || (o as Order).customerEmail || 'Client';
  }

  private addressLine(o: Partial<Order>): string {
    const a = (o as Order).shippingAddress;
    if (!a) return '';
    return [a.address1, a.city, a.province].filter(Boolean).join(', ');
  }

  private assertObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant livreur invalide');
    }
  }
}

function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}
