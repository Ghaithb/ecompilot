import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY must be defined');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createCheckoutSession(orderId: string, tenantId: string) {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const tenant = await this.tenantModel.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Créer ou récupérer le client Stripe
      let customerId = tenant.integrations?.stripe?.customerId;
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: order.customerEmail,
          metadata: {
            tenantId: tenant._id.toString(),
          },
        });
        customerId = customer.id;

        // Mettre à jour le tenant avec l'ID client Stripe
        await this.tenantModel.findByIdAndUpdate(tenantId, {
          'integrations.stripe.customerId': customerId,
        });
      }

      // Créer la session de paiement
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: order.lineItems.map(item => ({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.title || 'Produit',
              description: item.description || '',
              images: item.images || [],
            },
            unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
          },
          quantity: item.quantity,
        })),
        success_url: `${this.configService.get('FRONTEND_URL')}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/order/cancel`,
        metadata: {
          orderId: orderId,
          tenantId: tenantId,
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      const orderId = session.metadata?.orderId;
      if (!orderId) {
        throw new Error('Order ID not found in session metadata');
      }

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Mettre à jour le statut de la commande
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        provider: 'stripe',
        transactionId: session.payment_intent as string,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'eur',
        status: 'completed',
        paidAt: new Date(),
      };
      order.updatedAt = new Date();
      await order.save();

      return { success: true, order };
    } catch (error) {
      this.logger.error('Error handling payment success:', error);
      throw error;
    }
  }
}
