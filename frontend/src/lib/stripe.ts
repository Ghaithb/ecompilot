import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Pour le développement, nous utilisons une clé de test
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_votrecleteststripepublique";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY) as Promise<Stripe | null>;

interface CheckoutSessionResponse {
  sessionId: string;
}

export const stripeService = {
  async createCheckoutSession(orderId: string): Promise<void> {
    try {
      // Call your backend API to create a Stripe checkout session
  const response = await fetch("/api/v1/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

  const { sessionId } = (await response.json()) as CheckoutSessionResponse;

      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      // Redirect to checkout
  window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },

  async handlePaymentSuccess(sessionId: string): Promise<void> {
    try {
      // Call your backend API to handle successful payment
  const response = await fetch("/api/v1/billing/payment-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to process payment success");
      }
    } catch (error) {
      console.error("Error handling payment success:", error);
      throw error;
    }
  },
};