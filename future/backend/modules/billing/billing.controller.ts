import { Controller, Post, Body, Headers, RawBodyRequest, Req, Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';
import type { Request } from 'express';

import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly stripeService: StripeService) {}

  // Créer une session de checkout Stripe
  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Créer une session de paiement Stripe', description: 'Crée une session de paiement Stripe pour une commande' })
  @ApiResponse({ status: 201, description: 'Session de paiement créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  @ApiBody({ schema: { properties: { orderId: { type: 'string', description: 'ID de la commande' } } } })
  async createCheckoutSession(@Body('orderId') orderId: string) {
    return this.stripeService.createCheckoutSession(orderId);
  }

  // Webhook Stripe pour les événements de paiement
  @Post('webhook')
  async handleWebhook(
    @Req() req,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody?.toString() || '';
    return this.stripeService.handleWebhook(payload, signature);
  }

  // Créer un payment intent (pour les paiements directs)
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body('amount') amount: number,
    @Body('currency') currency: string,
    @Body('metadata') metadata?: Record<string, string>,
  ) {
    return this.stripeService.createPaymentIntent(amount, currency, metadata);
  }

  // Rembourser un paiement
  @Post('refund')
  async refundPayment(
    @Body('paymentIntentId') paymentIntentId: string,
    @Body('amount') amount?: number,
  ) {
    return this.stripeService.refundPayment(paymentIntentId, amount);
  }

  // Webhook Stripe pour gérer les événements de paiement et d'abonnement
  @Post('stripe/webhook')
  async handleStripeWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
    const payload = req.rawBody?.toString() || '';
    return this.stripeService.handleWebhook(payload, signature);
  }
}
