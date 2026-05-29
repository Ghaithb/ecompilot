import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { ProductStockService } from '../products/product-stock.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { OtpService } from '../notifications/otp.service';
import { CodTrustService } from '../cod-trust/cod-trust.service';
import { normalizeTunisianPhone } from '../../common/utils/phone.util';
import { RealtimeService } from '../realtime/realtime.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly productStockService: ProductStockService,
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
    private readonly otpService: OtpService,
    private readonly codTrustService: CodTrustService,
    private readonly realtimeService: RealtimeService,
    private readonly whatsAppService: WhatsAppService,
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
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      tenantId,
      paymentMethod: createOrderDto.paymentMethod || 'stripe',
      isVerified: createOrderDto.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          status: createOrderDto.status || 'pending',
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
        await this.inventoryService.checkLowStock(tenantId);
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

    return createdOrder;
  }

  async findAll(tenantId: string) {
    return this.orderModel.find({ tenantId }).exec();
  }

  async findOne(id: string, tenantId: string) {
    return this.orderModel.findOne({ _id: id, tenantId }).exec();
  }

  async update(id: string, updateOrderDto: any, tenantId: string) {
    return this.orderModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        updateOrderDto,
        { new: true }
      )
      .exec();
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    // Machine à états simple
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) {
      throw new BadRequestException('Commande introuvable');
    }

    const oldStatus = order.status;

    // Vérifier transition autorisée
    if (!allowedTransitions[oldStatus]?.includes(status)) {
      throw new BadRequestException(
        `Transition de ${oldStatus} vers ${status} non autorisée`,
      );
    }

    // COD: bloquer expédition si OTP non vérifié (comme TikTak PRO)
    if (
      status === 'shipped' &&
      order.paymentMethod === 'cod' &&
      !order.isVerified
    ) {
      throw new BadRequestException(
        'Impossible d\'expédier: la commande COD doit être vérifiée par SMS (OTP) avant expédition',
      );
    }

    // COD: marquer payé à la livraison
    if (status === 'delivered' && order.paymentMethod === 'cod') {
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
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
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

    order.status = status;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: 'system',
    });

    await order.save();
    this.logger.log(`✅ Statut commande ${id} mis à jour: ${oldStatus} → ${status}`);

    return order;
  }

  async updatePaymentStatus(id: string, status: string, tenantId: string) {
    return this.orderModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { paymentStatus: status, updatedAt: new Date() },
        { new: true }
      )
      .exec();
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
      order.status = 'confirmed';
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