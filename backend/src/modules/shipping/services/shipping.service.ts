import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { ShippingProviderId } from '../enums/shipping-provider.enum';
import { CompareRatesDto, CreateShipmentDto } from '../dto/create-shipment.dto';
import { OrderShipmentContext } from '../interfaces/shipping-provider.interface';
import { mapOrderToShipmentContext } from '../utils/order-shipment.mapper';
import { FirstDeliveryProvider } from '../providers/first-delivery.provider';
import { ShippingFactoryService } from './shipping-factory.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly factory: ShippingFactoryService,
    private readonly firstDelivery: FirstDeliveryProvider,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  listProviders() {
    return this.factory.listProvidersMeta();
  }

  async compareRates(tenantId: string, dto: CompareRatesDto) {
    let context: OrderShipmentContext;

    if (dto.orderId) {
      const order = await this.findOrder(dto.orderId, tenantId);
      context = mapOrderToShipmentContext(order, { weightKg: dto.weightKg });
    } else {
      context = {
        orderId: 'quote',
        orderNumber: 'QUOTE',
        tenantId,
        customerName: 'Client',
        customerEmail: 'quote@ecompilot.local',
        customerPhone: '00000000',
        address: '—',
        city: dto.city || 'Tunis',
        province: dto.province || 'Tunis',
        country: dto.country || 'TN',
        weightKg: dto.weightKg || 1,
        currency: dto.currency || 'TND',
        total: 0,
        lineItems: [{ title: 'Colis', quantity: 1, price: 0 }],
      };
    }

    const rates = await Promise.all(
      this.factory.getAll().map((p) => p.getRates(context)),
    );

    return { context: { city: context.city, province: context.province, weightKg: context.weightKg }, rates };
  }

  async createShipment(tenantId: string, dto: CreateShipmentDto) {
    if (!dto.orderId) {
      throw new BadRequestException('orderId requis pour créer une expédition');
    }
    return this.createShipmentFromOrder(tenantId, dto.orderId, dto.provider, {
      weightKg: dto.weightKg,
      localityId: dto.localityId,
      notes: dto.notes,
    });
  }

  async createShipmentFromOrder(
    tenantId: string,
    orderId: string,
    providerId: ShippingProviderId,
    options?: { weightKg?: number; localityId?: number; notes?: string },
  ) {
    const order = await this.findOrder(orderId, tenantId);
    const provider = this.factory.get(providerId);
    const context = mapOrderToShipmentContext(order, options);

    if (!context.customerPhone) {
      throw new BadRequestException('Téléphone client requis pour la livraison');
    }

    const shipment = await provider.createShipment(context);

    order.trackingNumber = shipment.trackingNumber;
    order.shippingProvider = providerId;
    order.labelUrl = shipment.labelUrl;
    order.providerRef = shipment.providerRef;
    order.metadata = {
      ...order.metadata,
      shipping: {
        provider: providerId,
        trackingNumber: shipment.trackingNumber,
        labelUrl: shipment.labelUrl,
        providerRef: shipment.providerRef,
        mock: shipment.mock,
        createdAt: new Date(),
      },
    };

    if (['confirmed', 'prepared', 'created', 'pending'].includes(order.status)) {
      order.status = OrderStatus.SHIPPED;
      order.statusHistory.push({
        status: OrderStatus.SHIPPED,
        changedAt: new Date(),
        changedBy: 'shipping',
      });
    }

    await order.save();
    this.logger.log(`Expédition ${providerId} créée pour #${order.orderNumber}: ${shipment.trackingNumber}`);

    return { order: this.sanitizeOrder(order), shipment };
  }

  async trackShipment(providerId: ShippingProviderId, trackingNumber: string) {
    return this.factory.get(providerId).trackShipment(trackingNumber);
  }

  async cancelShipment(
    tenantId: string,
    orderId: string,
    providerId: ShippingProviderId,
  ) {
    const order = await this.findOrder(orderId, tenantId);
    if (!order.trackingNumber) {
      throw new BadRequestException('Aucun numéro de suivi sur cette commande');
    }
    const ok = await this.factory.get(providerId).cancelShipment(order.trackingNumber);
    return { success: ok, trackingNumber: order.trackingNumber };
  }

  async getFirstDeliveryLocalities() {
    return this.firstDelivery.getLocalities();
  }

  private async findOrder(orderId: string, tenantId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new BadRequestException('Commande introuvable');
    return order;
  }

  private sanitizeOrder(order: OrderDocument) {
    const o = order.toObject();
    return {
      _id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      trackingNumber: o.trackingNumber,
      shippingProvider: o.shippingProvider,
      labelUrl: o.labelUrl,
    };
  }
}
