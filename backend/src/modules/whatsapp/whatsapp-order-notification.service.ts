import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { RETURN_REASON_LABELS, ReturnReason } from '../../common/enums/return-reason.enum';
import { WhatsAppService } from './whatsapp.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class WhatsappOrderNotificationService {
  private readonly logger = new Logger(WhatsappOrderNotificationService.name);

  constructor(
    private readonly whatsAppService: WhatsAppService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async notifyStatusChange(
    tenantId: string,
    order: {
      orderNumber: string;
      total: number;
      currency: string;
      shippingAddress?: { phone?: string; firstName?: string };
      assignedDriverId?: string | Types.ObjectId;
      refusalReason?: string;
    },
    newStatus: string,
  ) {
    const phone = order.shippingAddress?.phone;
    const name = order.shippingAddress?.firstName || 'Client';

    try {
      switch (newStatus as OrderStatus) {
        case OrderStatus.CONFIRMED:
          if (phone) {
            await this.safeSend(tenantId, phone, `✅ ${name}, votre commande #${order.orderNumber} est confirmée. Préparation en cours.`);
          }
          break;

        case OrderStatus.ASSIGNED_TO_DRIVER:
          if (phone) {
            await this.safeSend(tenantId, phone, `📦 Commande #${order.orderNumber} : votre colis sera livré très bientôt.`);
          }
          if (order.assignedDriverId) {
            const driverId = String(order.assignedDriverId);
            const driver = await this.userModel.findById(driverId).lean();
            if (driver?.phone) {
              await this.safeSend(
                tenantId,
                driver.phone,
                `🚚 Nouvelle livraison assignée\n#${order.orderNumber}\n${order.total} ${order.currency}\nClient: ${phone}`,
              );
            }
          }
          break;

        case OrderStatus.OUT_FOR_DELIVERY:
          if (phone) {
            await this.safeSend(tenantId, phone, `🛵 Votre commande #${order.orderNumber} est en route vers vous.`);
          }
          break;

        case OrderStatus.DELIVERED:
        case OrderStatus.PAID:
          if (phone) {
            await this.safeSend(tenantId, phone, `🎉 Commande #${order.orderNumber} livrée. Merci pour votre confiance !`);
          }
          break;

        case OrderStatus.REFUSED: {
          const reasonLabel =
            RETURN_REASON_LABELS[order.refusalReason as ReturnReason] || order.refusalReason || 'Non précisée';
          this.logger.log(`Refus #${order.orderNumber}: ${reasonLabel}`);
          break;
        }

        case OrderStatus.RETURNED_TO_SELLER:
          this.logger.log(`Retour vendeur #${order.orderNumber}`);
          break;

        default:
          break;
      }
    } catch (e) {
      this.logger.warn(`Notification WhatsApp ignorée: ${(e as Error).message}`);
    }
  }

  private async safeSend(tenantId: string, to: string, message: string) {
    await this.whatsAppService.sendTextMessage(tenantId, { to, message });
  }
}
