import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { stripeService } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types/order";

interface StripePaymentButtonProps {
  order: Order;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export const StripePaymentButton = ({
  order,
  onSuccess,
  onError,
  disabled
}: StripePaymentButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (isProcessing || disabled) return;

    try {
      setIsProcessing(true);
      await stripeService.createCheckoutSession(order._id);
      onSuccess?.();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du traitement du paiement.",
        variant: "destructive",
      });
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      variant="default" 
      onClick={handlePayment}
      disabled={isProcessing || disabled}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {isProcessing ? "Traitement..." : "Payer avec Stripe"}
    </Button>
  );
};