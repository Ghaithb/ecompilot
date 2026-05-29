import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null;

  constructor(
    private configService: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');
    
    if (!stripeSecretKey || stripeSecretKey.includes('sk_test_') === false) {
      this.logger.warn('⚠️ Clé Stripe non configurée ou invalide - Mode simulation activé');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-08-27.basil',
      });
      this.logger.log('✅ Stripe configuré avec succès');
    }
  }

  async createCheckoutSession(orderId: string, successUrl?: string, cancelUrl?: string) {
    try {
      const order = await this.orderModel.findById(orderId).exec();
      if (!order) {
        throw new BadRequestException('Commande non trouvée');
      }

      // Mode simulation si Stripe non configuré
      if (!this.stripe) {
        const sessionId = `cs_test_${orderId}_${Date.now()}`;
        this.logger.log(`Mode simulation - Session créée: ${sessionId}`);
        return { 
          sessionId,
          url: `https://checkout.stripe.com/c/pay/${sessionId}`,
          mode: 'simulation'
        };
      }

      // Créer les line items pour Stripe
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.lineItems.map(item => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: item.title,
            description: (item as any).description ?? '',
          },
          unit_amount: Math.round(item.price * 100), // Convertir en centimes
        },
        quantity: item.quantity,
      }));

      // Ajouter les frais de livraison si nécessaire
      if (order.shippingAmount > 0) {
        lineItems.push({
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: 'Frais de livraison',
            },
            unit_amount: Math.round(order.shippingAmount * 100),
          },
          quantity: 1,
        });
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl || `${process.env.FRONTEND_URL}/orders?success=true`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/orders?canceled=true`,
        metadata: {
          orderId: orderId,
          tenantId: order.tenantId.toString(),
        },
        customer_email: order.customerEmail,
        shipping_address_collection: {
          allowed_countries: ['FR', 'BE', 'CH', 'CA', 'US'],
        },
      });

      this.logger.log(`Session Stripe créée: ${session.id}`);
      return {
        sessionId: session.id,
        url: session.url,
        mode: 'live'
      };

    } catch (error) {
      this.logger.error(`Erreur création session Stripe: ${error.message}`);
      throw new BadRequestException('Erreur lors de la création de la session de paiement');
    }
  }

  async handleWebhook(payload: string, signature: string) {
    try {
      if (!this.stripe) {
        this.logger.warn('Webhook reçu mais Stripe non configuré');
        return { received: true, mode: 'simulation' };
      }

      const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
      if (!webhookSecret) {
        throw new BadRequestException('Webhook secret non configuré');
      }

      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      this.logger.log(`Webhook reçu: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          this.logger.log(`Type d'événement non géré: ${event.type}`);
      }

      return { received: true, mode: 'live' };

    } catch (error) {
      this.logger.error(`Erreur webhook Stripe: ${error.message}`);
      throw new BadRequestException('Erreur lors du traitement du webhook');
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      this.logger.error('OrderId manquant dans les métadonnées de la session');
      return;
    }

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      this.logger.error(`Commande non trouvée: ${orderId}`);
      return;
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.updatedAt = new Date();
    await order.save();

    this.logger.log(`Commande ${orderId} marquée comme payée`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      this.logger.error('OrderId manquant dans les métadonnées du payment intent');
      return;
    }

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      this.logger.error(`Commande non trouvée: ${orderId}`);
      return;
    }

    order.paymentStatus = 'failed';
    order.updatedAt = new Date();
    await order.save();

    this.logger.log(`Commande ${orderId} marquée comme échouée`);
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configuré');
    }

    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: currency.toLowerCase(),
      metadata: metadata || {},
    });
  }

  async refundPayment(paymentIntentId: string, amount?: number) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configuré');
    }

    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    return await this.stripe.refunds.create(refundData);
  }

  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configuré');
    }

    return await this.stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configuré');
    }

    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async updateSubscription(subscriptionId: string, newPriceId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configuré');
    }

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    return await this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe non configuré');
    }

    if (atPeriodEnd) {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    }
  }
}
