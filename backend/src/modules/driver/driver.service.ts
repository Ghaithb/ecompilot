import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderStatusService } from '../orders/order-status.service';
import { ReturnsService } from '../orders/returns.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { WhatsappOrderNotificationService } from '../whatsapp/whatsapp-order-notification.service';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly orderStatusService: OrderStatusService,
    private readonly returnsService: ReturnsService,
    private readonly whatsappNotifications: WhatsappOrderNotificationService,
  ) {}

  async listTodayDeliveries(tenantId: string, driverId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const activeStatuses = [
      OrderStatus.ASSIGNED_TO_DRIVER,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.SHIPPED,
    ];

    return this.orderModel
      .find({
        tenantId,
        assignedDriverId: new Types.ObjectId(driverId),
        status: { $in: activeStatuses },
        createdAt: { $gte: start },
      })
      .sort({ createdAt: 1 })
      .lean();
  }

  async listDeliveries(tenantId: string, driverId: string, filter: 'today' | 'active' | 'done' = 'today') {
    const query: Record<string, unknown> = {
      tenantId,
      assignedDriverId: new Types.ObjectId(driverId),
    };

    if (filter === 'done') {
      query.status = { $in: [OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.COMPLETED, OrderStatus.REFUSED] };
    } else if (filter === 'active') {
      query.status = {
        $in: [
          OrderStatus.ASSIGNED_TO_DRIVER,
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.SHIPPED,
        ],
      };
    } else {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: start };
      query.status = {
        $nin: [OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.RETURN_COMPLETED],
      };
    }

    return this.orderModel.find(query).sort({ createdAt: 1 }).lean();
  }

  async getDelivery(orderId: string, tenantId: string, driverId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      tenantId,
      assignedDriverId: driverId,
    });
    if (!order) throw new BadRequestException('Livraison introuvable');
    return order;
  }

  async updateDeliveryStatus(
    orderId: string,
    tenantId: string,
    driverId: string,
    dto: UpdateOrderStatusDto,
    actorRoles: string[],
  ) {
    if (dto.status === OrderStatus.REFUSED) {
      if (!dto.refusalReason) {
        throw new BadRequestException('Raison de refus obligatoire');
      }
      if (!dto.deliveryProofUrl) {
        throw new BadRequestException('Photo de preuve obligatoire pour un refus');
      }
      const result = await this.returnsService.refuseOnDelivery(
        orderId,
        tenantId,
        driverId,
        dto.refusalReason,
        dto.deliveryProofUrl,
        actorRoles,
      );
      await this.whatsappNotifications.notifyStatusChange(tenantId, result, OrderStatus.REFUSED);
      return result;
    }

    const order = await this.getDelivery(orderId, tenantId, driverId);
    const next = this.orderStatusService.assertTransition(order.status, dto.status, actorRoles);

    if (dto.status === OrderStatus.DELIVERED || dto.status === OrderStatus.PAID) {
      if (!dto.deliveryProofUrl) {
        throw new BadRequestException('Photo de livraison obligatoire');
      }
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        order.amountToCollect = order.total;
        if (dto.amountCollected != null && dto.amountCollected < order.total) {
          throw new BadRequestException('Montant collecté insuffisant');
        }
        if (dto.amountCollected != null) {
          order.amountToCollect = dto.amountCollected;
        }
      }
    }

    if (dto.deliveryProofUrl) order.deliveryProofUrl = dto.deliveryProofUrl;

    order.status = next;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: next,
      changedAt: new Date(),
      changedBy: driverId,
    });
    await order.save();
    await this.whatsappNotifications.notifyStatusChange(tenantId, order, next);
    return order;
  }

  async driverStats(tenantId: string, driverId: string) {
    const base = { tenantId, assignedDriverId: new Types.ObjectId(driverId) };
    const [todayCount, delivered, refused, toCollect] = await Promise.all([
      this.orderModel.countDocuments({
        ...base,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      this.orderModel.countDocuments({
        ...base,
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.COMPLETED] },
      }),
      this.orderModel.countDocuments({ ...base, status: OrderStatus.REFUSED }),
      this.orderModel.aggregate([
        { $match: { ...base, status: OrderStatus.OUT_FOR_DELIVERY, paymentMethod: 'cod' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    return {
      deliveriesToday: todayCount,
      deliveredTotal: delivered,
      refusedTotal: refused,
      amountToCollect: toCollect[0]?.total || 0,
    };
  }
}
