import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  compareDeliveryRates,
  createShipmentFromOrder,
  fetchDeliveryProviders,
  PROVIDER_LABELS,
  type DeliveryProviderId,
} from '@/modules/delivery/services/deliveryApi';

type Props = {
  orderId: string;
  orderNumber: string;
  hasTracking?: boolean;
};

export const CreateShipmentPanel: React.FC<Props> = ({
  orderId,
  orderNumber,
  hasTracking,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<DeliveryProviderId>('intigo');

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
  });

  const compareMutation = useMutation({
    mutationFn: () => compareDeliveryRates(orderId),
    onSuccess: (rates: { provider: string; rate: number; currency: string; estimatedDays: number }[]) => {
      const lines = rates
        .map((r) => `${r.provider}: ${r.rate} ${r.currency} (~${r.estimatedDays}j)`)
        .join('\n');
      toast({
        title: 'Tarifs estimés',
        description: lines || 'Aucun tarif disponible',
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Erreur tarifs', description: e.message, variant: 'destructive' }),
  });

  const createMutation = useMutation({
    mutationFn: () => createShipmentFromOrder(orderId, { provider, async: false }),
    onSuccess: (res: {
      queued?: boolean;
      shipment?: { trackingNumber?: string; _id?: string };
    }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-shipments'] });
      const tn = res?.shipment?.trackingNumber;
      toast({
        title: res?.queued ? 'En file d\'attente' : 'Expédition créée',
        description: tn ? `Suivi: ${tn}` : 'Colis enregistré',
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Expédition impossible', description: e.message, variant: 'destructive' }),
  });

  if (hasTracking) {
    return <span className="text-xs text-muted-foreground">Expédié</span>;
  }

  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Select value={provider} onValueChange={(v) => setProvider(v as DeliveryProviderId)}>
          <SelectTrigger className="h-8 text-xs" aria-label={`Transporteur pour ${orderNumber}`}>
            <SelectValue placeholder="Transporteur" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id} disabled={!p.configured}>
                {PROVIDER_LABELS[p.id as DeliveryProviderId] || p.name}
                {!p.configured ? ' (non connecté)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1"
          disabled={compareMutation.isPending}
          onClick={() => compareMutation.mutate()}
        >
          Tarifs
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-7 text-xs flex-1"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Truck className="h-3 w-3 mr-1" />
              Expédier
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
