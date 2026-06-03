import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AppRole } from '../../common/enums/app-role.enum';
import { ProductStockService } from '../products/product-stock.service';
import { ProductsService } from '../products/products.service';
import { OtpService } from '../notifications/otp.service';
import { CodTrustService } from '../cod-trust/cod-trust.service';
import { normalizeTunisianPhone } from '../../common/utils/phone.util';
import { RealtimeService } from '../../core/stubs/realtime.stub';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { WhatsappOrderNotificationService } from '../whatsapp/whatsapp-order-notification.service';
import { OrderStatusService } from './order-status.service';
import { OrderStatus, normalizeOrderStatus } from '../../common/enums/order-status.enum';
import { Types } from 'mongoose';
import { EventBusService } from '../../core/events/event-bus.service';
import { DomainEvents } from '../../core/events/domain-events.constants';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly productStockService: ProductStockService,
    private readonly productsService: ProductsService,
    private readonly otpService: OtpService,
    private readonly codTrustService: CodTrustService,
    private readonly realtimeService: RealtimeService,
    private readonly whatsAppService: WhatsAppService,
    private readonly orderStatusService: OrderStatusService,
    private readonly whatsappNotifications: WhatsappOrderNotificationService,
    private readonly events: EventBusService,
  ) {}

  async create(createOrderDto: any, tenantId: string) {
    this.logger.log(`📦 Création commande pour tenant ${tenantId}`);

    const paymentMethod = createOrderDto.paymentMethod || 'stripe';
    const phone = createOrderDto.shippingAddress?.phone;

    if (paymentMethod === 'cod' && phone) {
      const normalized = normalizeTunisianPhone(phone);
      if (!this.codTrustService.validatePhone(normalized)) {
        throw new BadRequestException('Numéro de téléphone tunisien invalide');
      }
      const trust = await this.codTrustService.checkOrderAllowed(tenantId, normalized);
      if (!trust.allowed) {
        this.realtimeService.suspectCustomer(tenantId, normalized, trust.reason || 'Commande bloquée');
        throw new BadRequestException(trust.reason || 'Commande COD non autorisée pour ce numéro');
      }
      createOrderDto.shippingAddress.phone = normalized;
      createOrderDto.billingAddress = createOrderDto.billingAddress || createOrderDto.shippingAddress;
      createOrderDto.billingAddress.phone = normalized;
      createOrderDto.codTrustScore = trust.score;
      createOrderDto.codTrustLevel = trust.level;
    }

    // 1. Normaliser lineItems + vérifier stock
    const lineItems = createOrderDto.lineItems || [];
    for (const item of lineItems) {
      if (item.productId) {
        item.variantId = await this.productsService.resolveVariantRef(
          tenantId,
          item.productId,
          item.variantId,
        );
      }
    }

    const availability = await this.productStockService.checkAvailability(
      tenantId,
      lineItems,
    );

    if (!availability.allAvailable) {
      const unavailableList = availability.unavailableItems
        .map(
          (item) =>
            `${item.productTitle} (demandé: ${item.requested}, disponible: ${item.available})`,
        )
        .join(', ');

      this.logger.error(`❌ Stock insuffisant: ${unavailableList}`);

      throw new BadRequestException({
        message: 'Stock insuffisant pour certains produits',
        unavailableItems: availability.unavailableItems,
      });
    }

    // 2. Créer la commande
    const initialStatus = createOrderDto.status || OrderStatus.CREATED;
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      tenantId,
      status: initialStatus,
      paymentMethod: createOrderDto.paymentMethod || 'stripe',
      isVerified: createOrderDto.isVerified || false,
      amountToCollect:
        (createOrderDto.paymentMethod || 'stripe') === 'cod' ? createOrderDto.total : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          status: initialStatus,
          changedAt: new Date(),
          changedBy: 'system',
        },
      ],
    });

    await createdOrder.save();
    this.logger.log(`✅ Commande créée: ${createdOrder._id}`);

    // 3. Décrémenter le stock atomiquement pour chaque produit
    try {
      await this.productStockService.bulkUpdateStock(
        tenantId,
        createOrderDto.lineItems || [],
        'decrement',
      );
      this.logger.log(`✅ Stock décrémenté pour commande ${createdOrder._id}`);
    } catch (error) {
      // Si décrément échoue, annuler la commande
      this.logger.error(`❌ Échec décrément stock, annulation commande ${createdOrder._id}`);
      await this.orderModel.findByIdAndDelete(createdOrder._id);
      throw error;
    }

    // 4. Vérifier si des produits sont maintenant en stock bas
    setTimeout(async () => {
      try {
        // MVP: alertes stock avancées désactivées (module inventory archivé)
      } catch (err) {
        this.logger.error('Erreur vérification stock bas:', err);
      }
    }, 1000);

    // 5. Si c'est du COD, générer et envoyer un OTP
    if (createdOrder.paymentMethod === 'cod') {
      const phone = createOrderDto.shippingAddress?.phone;
      if (phone) {
        await this.otpService.generateAndSendOtp(
          tenantId,
          phone,
          'order_verification',
          createdOrder._id.toString(),
        );
      }
    }

    this.realtimeService.newOrder(tenantId, {
      id: createdOrder._id.toString(),
      total: createdOrder.total,
      currency: createdOrder.currency || 'TND',
      paymentMethod: createdOrder.paymentMethod,
      codTrustLevel: createOrderDto.codTrustLevel,
      customerPhone: createOrderDto.shippingAddress?.phone,
    });


    this.events.publishSync(DomainEvents.ORDER_CREATED, {
      tenantId,
      orderId: createdOrder._id.toString(),
      orderNumber: createdOrder.orderNumber,
      total: createdOrder.total,
      currency: createdOrder.currency || 'TND',
      paymentMethod: createdOrder.paymentMethod,
    });

    return createdOrder;
  }

  async findAll(tenantId: string) {
    return this.orderModel.find({ tenantId }).exec();
  }

  async findOne(id: string, tenantId: string) {
    return this.orderModel.findOne({ _id: id, tenantId }).exec();
  }

  async getWorkflowSummary(tenantId: string) {
    const orders = await this.orderModel.find({ tenantId }).lean();
    const countBy = (statuses: string[]) =>
      orders.filter((order) => statuses.includes(normalizeOrderStatus(order.status))).length;
    const codToConfirm = orders.filter(
      (order) =>
        order.paymentMethod === 'cod' &&
        !order.isVerified &&
        [OrderStatus.CREATED, OrderStatus.CONFIRMED].includes(normalizeOrderStatus(order.status)),
    ).length;
    const missingTracking = orders.filter(
      (order) =>
        !order.trackingNumber &&
        ![
          OrderStatus.CANCELLED,
          OrderStatus.DELIVERED,
          OrderStatus.PAID,
          OrderStatus.COMPLETED,
          OrderStatus.REFUSED,
        ].includes(normalizeOrderStatus(order.status)),
    ).length;

    return {
      total: orders.length,
      stages: {
        created: countBy([OrderStatus.CREATED]),
        confirmed: countBy([OrderStatus.CONFIRMED]),
        prepared: countBy([OrderStatus.PREPARED]),
        shipped: countBy([OrderStatus.SHIPPED, OrderStatus.ASSIGNED_TO_DRIVER, OrderStatus.OUT_FOR_DELIVERY]),
        delivered: countBy([OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.COMPLETED]),
        returns: countBy([OrderStatus.REFUSED, OrderStatus.RETURNED_TO_SELLER, OrderStatus.RETURN_COMPLETED]),
        cancelled: countBy([OrderStatus.CANCELLED]),
      },
      actions: {
        codToConfirm,
        missingTracking,
        paymentPending: orders.filter((order) => order.paymentStatus === 'pending').length,
        readyToShip: countBy([OrderStatus.PREPARED]),
      },
      queues: {
        confirmation: orders
          .filter((order) => [OrderStatus.CREATED, OrderStatus.CONFIRMED].includes(normalizeOrderStatus(order.status)))
          .slice(0, 10)
          .map((order) => this.workflowOrderRow(order)),
        delivery: orders
          .filter((order) =>
            [OrderStatus.SHIPPED, OrderStatus.ASSIGNED_TO_DRIVER, OrderStatus.OUT_FOR_DELIVERY].includes(
              normalizeOrderStatus(order.status),
            ),
          )
          .slice(0, 10)
          .map((order) => this.workflowOrderRow(order)),
        exceptions: orders
          .filter((order) => !order.trackingNumber || order.status === OrderStatus.REFUSED)
          .slice(0, 10)
          .map((order) => this.workflowOrderRow(order)),
      },
    };
  }

  private workflowOrderRow(order: any) {
    return {
      id: order._id?.toString?.() || String(order._id),
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      trackingNumber: order.trackingNumber,
      shippingProvider: order.shippingProvider,
      nextStatuses: this.orderStatusService.listNextStatuses(order.status),
    };
  }

  async assignDriver(
    orderId: string,
    tenantId: string,
    driverId: string,
    actorRoles: string[] = ['merchant'],
  ) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');

    const driver = await this.userModel.findOne({
      _id: driverId,
      tenantId,
      roles: { $in: [AppRole.DRIVER] },
      isActive: true,
    });
    if (!driver) {
      throw new BadRequestException('Livreur introuvable ou inactif pour cette boutique');
    }

    const next = this.orderStatusService.assertTransition(
      order.status,
      OrderStatus.ASSIGNED_TO_DRIVER,
      actorRoles,
    );

    order.assignedDriverId = new Types.ObjectId(driverId);
    order.status = next;
    order.amountToCollect = order.paymentMethod === 'cod' ? order.total : 0;
    order.statusHistory.push({
      status: next,
      changedAt: new Date(),
      changedBy: 'merchant',
    });
    await order.save();
    await this.whatsappNotifications.notifyStatusChange(tenantId, order, next);
    return order;
  }

  async trackPublicOrder(orderNumber: string, phone: string) {
    const normalized = normalizeTunisianPhone(phone);
    const order = await this.orderModel
      .findOne({
        orderNumber,
        'shippingAddress.phone': normalized,
      })
      .select('-metadata')
      .lean();

    if (!order) {
      throw new BadRequestException('Commande introuvable');
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      carrier: order.shippingProvider,
      estimatedDelivery: order.metadata?.estimatedDeliveryAt,
      createdAt: order.createdAt,
      statusHistory: (order.statusHistory || []).sort(
        (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      ),
      nextSteps: this.orderStatusService.listNextStatuses(order.status),
    };
  }

  async update(id: string, updateOrderDto: any, tenantId: string) {
    const updated = await this.orderModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        updateOrderDto,
        { new: true },
      )
      .exec();
    return updated;
  }

  async updateStatus(
    id: string,
    status: string,
    tenantId: string,
    actorRoles: string[] = ['merchant'],
    changedBy = 'system',
  ) {
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) {
      throw new BadRequestException('Commande introuvable');
    }

    const oldStatus = order.status;
    const nextStatus = this.orderStatusService.assertTransition(
      oldStatus,
      status,
      actorRoles,
    );

    const shipStatuses = [
      OrderStatus.SHIPPED,
      OrderStatus.ASSIGNED_TO_DRIVER,
      OrderStatus.OUT_FOR_DELIVERY,
    ];
    if (
      shipStatuses.includes(nextStatus) &&
      order.paymentMethod === 'cod' &&
      !order.isVerified
    ) {
      throw new BadRequestException(
        'Impossible d\'expédier: la commande COD doit être vérifiée par SMS (OTP) avant expédition',
      );
    }

    if (
      (nextStatus === OrderStatus.DELIVERED || nextStatus === OrderStatus.PAID) &&
      order.paymentMethod === 'cod'
    ) {
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        provider: 'cod',
        transactionId: `cod-${order.orderNumber}`,
        amount: order.total,
        currency: order.currency,
        status: 'paid',
        paidAt: new Date(),
      };
    }

    // 🔥 CRITIQUE: Restaurer le stock si annulation
    if (nextStatus === OrderStatus.CANCELLED && oldStatus !== OrderStatus.CANCELLED) {
      this.logger.log(`♻️ Restauration stock pour commande annulée ${id}`);

      try {
        // Convertir lineItems en format attendu par ProductStockService
        const lineItemsForStock = (order.lineItems || []).map((item) => ({
          productId: item.productId.toString(),
          variantId: item.variantId.toString(),
          quantity: item.quantity,
          title: item.title,
        }));

        await this.productStockService.bulkUpdateStock(
          tenantId,
          lineItemsForStock,
          'increment',
        );
        this.logger.log(`✅ Stock restauré pour commande ${id}`);
      } catch (error) {
        this.logger.error(`❌ Échec restauration stock pour commande ${id}:`, error);
        // On continue quand même pour marquer la commande comme annulée
      }
    }

    order.status = nextStatus;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: nextStatus,
      changedAt: new Date(),
      changedBy,
    });

    await order.save();
    this.logger.log(`✅ Statut commande ${id} mis à jour: ${oldStatus} → ${nextStatus}`);

    // skip mirror

    await this.whatsappNotifications.notifyStatusChange(tenantId, order, nextStatus);

    return order;
  }

  async findReturns(tenantId: string) {
    return this.orderModel
      .find({
        tenantId,
        status: {
          $in: [
            OrderStatus.REFUSED,
            OrderStatus.RETURNED_TO_SELLER,
            OrderStatus.RETURN_COMPLETED,
            OrderStatus.RETURN_REJECTED,
          ],
        },
      })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async getReturnsStats(tenantId: string) {
    const statuses = [
      OrderStatus.REFUSED,
      OrderStatus.RETURNED_TO_SELLER,
      OrderStatus.RETURN_COMPLETED,
    ];
    const counts = await Promise.all(
      statuses.map((s) => this.orderModel.countDocuments({ tenantId, status: s })),
    );
    const totalOrders = await this.orderModel.countDocuments({ tenantId });
    const refused = counts[0];
    return {
      refused,
      returnedToSeller: counts[1],
      returnCompleted: counts[2],
      returnRatePercent: totalOrders ? Math.round((refused / totalOrders) * 1000) / 10 : 0,
    };
  }

  async updatePaymentStatus(id: string, status: string, tenantId: string) {
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');
    order.paymentStatus = status;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: `payment_${status}`,
      changedAt: new Date(),
      changedBy: 'merchant',
    });
    await order.save();
    // skip mirror
    return order;
  }

  async remove(id: string, tenantId: string) {
    return this.orderModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }

  /**
   * Vérifie l'OTP pour une commande
   */
  async verifyOtp(id: string, code: string, tenantId: string) {
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) {
      throw new BadRequestException('Commande introuvable');
    }

    if (order.isVerified) {
      return { success: true, message: 'Commande déjà vérifiée' };
    }

    const phone = order.shippingAddress?.phone;
    if (!phone) {
      throw new BadRequestException('Aucun numéro de téléphone associé à cette commande');
    }

    const isValid = await this.otpService.verifyOtp(
      tenantId,
      phone,
      code,
      'order_verification',
    );

    if (isValid) {
      order.isVerified = true;
      order.status = OrderStatus.CONFIRMED;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: OrderStatus.CONFIRMED,
        changedAt: new Date(),
        changedBy: 'otp',
      });
      await order.save();
      if (phone) {
        await this.codTrustService.recordVerifiedOrder(
          tenantId,
          phone,
          order.customerEmail,
        );
        await this.whatsAppService.sendTextMessage(tenantId, {
          to: phone,
          message: `✅ Commande confirmée! Merci. Nous vous contactons bientôt pour la livraison.`,
        });
      }
      this.realtimeService.otpVerified(tenantId, {
        id: order._id.toString(),
        total: order.total,
        currency: order.currency || 'TND',
      });
      return { success: true, message: 'Commande vérifiée et confirmée' };
    }

    throw new BadRequestException('Code de vérification invalide ou expiré');
  }
}
