import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DeliveryPageShell } from '../components/DeliveryPageShell';
import { ProviderBadge } from '../components/ProviderBadge';
import { ShipmentStatusBadge } from '../components/ShipmentStatusBadge';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import {
  cancelShipment,
  fetchShipment,
  syncShipmentTracking,
} from '../services/deliveryApi';

const DeliveryShipmentDetailPage: React.FC = () => {
  const { shipmentId = '' } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipment, isLoading, error } = useQuery({
    queryKey: ['delivery-shipment', shipmentId],
    queryFn: () => fetchShipment(shipmentId),
    enabled: Boolean(shipmentId),
  });

  const syncMutation = useMutation({
    mutationFn: () => syncShipmentTracking(shipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-shipment', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['delivery-shipments'] });
      toast({ title: 'Suivi mis à jour' });
    },
    onError: (e: Error) =>
      toast({ title: 'Sync échouée', description: e.message, variant: 'destructive' }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelShipment(shipmentId),
    onSuccess: (res: { providerCancelled?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-shipment', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['delivery-shipments'] });
      toast({
        title: 'Expédition annulée',
        description: res?.providerCancelled
          ? 'Confirmé chez le transporteur'
          : 'Annulée localement',
      });
    },
    onError: (e: Error) =>
      toast({ title: 'Annulation impossible', description: e.message, variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <DeliveryPageShell title="Expédition introuvable">
        <Button variant="outline" asChild>
          <Link to="/delivery/shipments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
      </DeliveryPageShell>
    );
  }

  const canCancel = !['delivered', 'cancelled'].includes(shipment.status);

  return (
    <DeliveryPageShell
      title={`Commande ${shipment.orderNumber || '—'}`}
      description={`Suivi ${shipment.trackingNumber}`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/delivery/shipments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Liste
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualiser suivi
          </Button>
          {canCancel && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Annuler l&apos;expédition ?</DialogTitle>
                  <DialogDescription>
                    La demande sera envoyée au transporteur si possible. Cette action est
                    irréversible pour les colis déjà pris en charge.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Confirmer l&apos;annulation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShipmentTimeline events={shipment.trackingHistory || []} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Statut</p>
                <div className="mt-2">
                  <ShipmentStatusBadge status={shipment.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Transporteur
                </p>
                <div className="mt-2">
                  <ProviderBadge provider={shipment.provider} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  N° suivi
                </p>
                <p className="font-mono text-sm mt-1 break-all">{shipment.trackingNumber}</p>
              </div>
              {shipment.labelUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={shipment.labelUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Étiquette
                  </a>
                </Button>
              )}
              {shipment.mock && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-md p-2">
                  Mode simulation — aucune API réelle appelée.
                </p>
              )}
              {(shipment.lastWebhookAt || shipment.lastSyncedAt) && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  {shipment.lastWebhookAt && (
                    <p>Dernier webhook : {new Date(shipment.lastWebhookAt).toLocaleString()}</p>
                  )}
                  {shipment.lastSyncedAt && (
                    <p>Dernière sync : {new Date(shipment.lastSyncedAt).toLocaleString()}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DeliveryPageShell>
  );
};

export default DeliveryShipmentDetailPage;
