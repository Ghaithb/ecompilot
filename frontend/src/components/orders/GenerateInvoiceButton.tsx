import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { type Order } from "@/types/order";
import { generateInvoicePdf } from "@/lib/generate-invoice";
import { useToast } from "@/hooks/use-toast";

interface GenerateInvoiceButtonProps {
  order: Order;
  disabled?: boolean;
}

export const GenerateInvoiceButton = ({ order, disabled }: GenerateInvoiceButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    if (isGenerating || disabled) return;

    try {
      setIsGenerating(true);
      await generateInvoicePdf(order);
      toast({
        title: "Facture générée",
        description: "La facture a été générée et téléchargée avec succès.",
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleGeneratePDF}
      disabled={isGenerating || disabled}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? "Génération..." : "Générer la facture"}
    </Button>
  );
};