import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import {
  createShipmentFromOrder,
  fetchDeliveryProviders,
  PROVIDER_LABELS,
} from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';

export const CreateShipmentDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [provider, setProvider] = useState<DeliveryProviderId>('intigo');
  const [weightKg, setWeightKg] = useState('1');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    enabled: open,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
    enabled: open,
  });

  const shippable = orders.filter(
    (o: { _id: string; trackingNumber?: string; status: string }) =>
      !o.trackingNumber && !['cancelled', 'refused'].includes(o.status),
  );

  const createMutation = useMutation({
    mutationFn: () =>
      createShipmentFromOrder(orderId, {
        provider,
        weightKg: parseFloat(weightKg) || 1,
        async: true,
      }),
    onSuccess: (res: { queued?: boolean; shipment?: { _id: string; trackingNumber?: string } }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-overview'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOpen(false);
      const tn = res?.shipment?.trackingNumber;
      toast({
        title: res?.queued ? 'Expédition en file' : 'Expédition créée',
        description: tn ? `Suivi: ${tn}` : 'Traitement en cours',
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-sm">
          <PackagePlus className="h-4 w-4 mr-2" />
          Nouvelle expédition
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une expédition</DialogTitle>
          <DialogDescription>
            Choisissez une commande et un transporteur connecté.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Commande</Label>
            <Select value={orderId} onValueChange={setOrderId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une commande" />
              </SelectTrigger>
              <SelectContent>
                {shippable.map((o: { _id: string; orderNumber: string }) => (
                  <SelectItem key={o._id} value={o._id}>
                    #{o.orderNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shippable.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune commande éligible.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Transporteur</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as DeliveryProviderId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={!p.configured}>
                    {PROVIDER_LABELS[p.id as DeliveryProviderId] || p.name}
                    {!p.configured ? ' — non connecté' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Poids (kg)</Label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!orderId || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
