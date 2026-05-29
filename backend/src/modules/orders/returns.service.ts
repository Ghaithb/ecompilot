import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { ReturnReason } from '../../common/enums/return-reason.enum';
import { OrderStatusService } from './order-status.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly orderStatusService: OrderStatusService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async refuseOnDelivery(
    orderId: string,
    tenantId: string,
    driverId: string,
    reason: ReturnReason,
    proofUrl?: string,
    actorRoles: string[] = [],
  ) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      tenantId,
      assignedDriverId: driverId,
    });
    if (!order) {
      throw new BadRequestException('Commande non trouvée ou non assignée à ce livreur');
    }

    this.orderStatusService.assertTransition(order.status, OrderStatus.REFUSED, actorRoles);

    order.status = OrderStatus.REFUSED;
    order.refusalReason = reason;
    order.returnReason = reason;
    if (proofUrl) order.deliveryProofUrl = proofUrl;
    order.paymentStatus = 'pending';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: OrderStatus.REFUSED,
      changedAt: new Date(),
      changedBy: driverId,
    });

    await order.save();

    await this.notifyMerchant(tenantId, order, `Refus livraison — ${reason}`);

    return order;
  }

  async markReturnedToSeller(orderId: string, tenantId: string, actorId: string, actorRoles: string[]) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');

    this.orderStatusService.assertTransition(
      order.status,
      OrderStatus.RETURNED_TO_SELLER,
      actorRoles,
    );

    order.status = OrderStatus.RETURNED_TO_SELLER;
    order.statusHistory.push({
      status: OrderStatus.RETURNED_TO_SELLER,
      changedAt: new Date(),
      changedBy: actorId,
    });
    await order.save();
    await this.notifyMerchant(tenantId, order, 'Colis retourné — à vérifier');
    return order;
  }

  async completeReturn(
    orderId: string,
    tenantId: string,
    merchantId: string,
    decision: 'completed' | 'rejected',
    notes?: string,
  ) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');

    const target =
      decision === 'completed' ? OrderStatus.RETURN_COMPLETED : OrderStatus.RETURN_REJECTED;

    this.orderStatusService.assertTransition(order.status, target, ['merchant', 'admin']);

    order.status = target;
    order.returnDetails = {
      ...(order.returnDetails || {}),
      notes,
      processedAt: new Date(),
      processedBy: merchantId,
    };
    order.statusHistory.push({
      status: target,
      changedAt: new Date(),
      changedBy: merchantId,
    });
    await order.save();
    return order;
  }

  private async notifyMerchant(tenantId: string, order: OrderDocument, prefix: string) {
    try {
      const msg = `${prefix}\nCommande #${order.orderNumber}\nMontant: ${order.total} ${order.currency}`;
      this.logger.log(`[WhatsApp merchant] ${msg}`);
      // Notification marchand : numéro configuré dans settings tenant (à brancher)
      await this.whatsAppService.sendTextMessage(tenantId, {
        to: order.shippingAddress?.phone || '',
        message: msg,
      }).catch(() => undefined);
    } catch (e) {
      this.logger.warn(`Notification retour: ${(e as Error).message}`);
    }
  }
}
