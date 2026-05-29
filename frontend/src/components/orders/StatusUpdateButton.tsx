import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Truck, CheckCircle2, XCircle, Loader2, CreditCard } from "lucide-react";
import { type OrderStatus, type PaymentStatus } from "@/types/order";

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ElementType;
  description: string;
}

const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "En attente",
    color: "bg-yellow-500 hover:bg-yellow-600",
    icon: ShoppingCart,
    description: "Commande reçue, en attente de traitement",
  },
  confirmed: {
    label: "Confirmée",
    color: "bg-blue-500 hover:bg-blue-600",
    icon: Package,
    description: "Commande confirmée, en préparation",
  },
  shipped: {
    label: "Expédiée",
    color: "bg-purple-500 hover:bg-purple-600",
    icon: Truck,
    description: "Commande en cours de livraison",
  },
  delivered: {
    label: "Livrée",
    color: "bg-green-500 hover:bg-green-600",
    icon: CheckCircle2,
    description: "Commande livrée avec succès",
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-500 hover:bg-red-600",
    icon: XCircle,
    description: "Commande annulée",
  },
};

const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  pending: {
    label: "En attente",
    color: "bg-yellow-500 hover:bg-yellow-600",
    icon: CreditCard,
    description: "Paiement en attente",
  },
  paid: {
    label: "Payé",
    color: "bg-green-500 hover:bg-green-600",
    icon: CheckCircle2,
    description: "Paiement reçu",
  },
  refunded: {
    label: "Remboursé",
    color: "bg-blue-500 hover:bg-blue-600",
    icon: CreditCard,
    description: "Montant remboursé",
  },
  failed: {
    label: "Échoué",
    color: "bg-red-500 hover:bg-red-600",
    icon: XCircle,
    description: "Erreur de paiement",
  },
};

interface StatusUpdateButtonProps {
  type: "order" | "payment";
  currentStatus: OrderStatus | PaymentStatus;
  onUpdateStatus: (status: OrderStatus | PaymentStatus) => Promise<void>;
  disabled?: boolean;
}

export const StatusUpdateButton = ({
  type,
  currentStatus,
  onUpdateStatus,
  disabled = false,
}: StatusUpdateButtonProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const config = type === "order" ? orderStatusConfig : paymentStatusConfig;
  const currentConfig = config[currentStatus as keyof typeof config];

  const handleStatusUpdate = async (newStatus: OrderStatus | PaymentStatus) => {
    if (isUpdating || disabled) return;

    try {
      setIsUpdating(true);
      await onUpdateStatus(newStatus);
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
    } finally {
      setIsUpdating(false);
    }
  };

  const IconComponent = currentConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isUpdating || disabled}>
        <Button 
          variant="outline" 
          className="w-[200px] justify-start"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <IconComponent className="w-4 h-4 mr-2" />
          )}
          <Badge className={currentConfig.color}>
            {currentConfig.label}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {Object.entries(config).map(([status, statusConfig]) => {
          const StatusIcon = statusConfig.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusUpdate(status as OrderStatus | PaymentStatus)}
              disabled={status === currentStatus || isUpdating || disabled}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              <div className="flex flex-col">
                <span>{statusConfig.label}</span>
                <span className="text-xs text-muted-foreground">
                  {statusConfig.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};