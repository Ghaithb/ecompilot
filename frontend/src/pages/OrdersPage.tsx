import React, { useState, useMemo, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ShoppingCart } from 'lucide-react';
import { GenerateInvoiceButton } from '@/components/orders/GenerateInvoiceButton';
import { StatusUpdateButton } from '@/components/orders/StatusUpdateButton';
import { AssignDriverSelect } from '@/components/orders/AssignDriverSelect';
import { CreateShipmentPanel } from '@/components/orders/CreateShipmentPanel';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { ExportButton } from '@/components/orders/ExportButton';
import { StripePaymentButton } from '@/components/orders/StripePaymentButton';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import { type Order, type OrderStatus, type PaymentStatus } from '@/types/order';
import { EmptyState, EmptyCartIllustration } from '@/components/ui/empty-state';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogContent = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />
);
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);

interface FiltersState {
  search: string;
  status: OrderStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
}

interface EditFormState {
  orderNumber: string;
  customerEmail: string;
  total: number;
  currency: string;
}

const OrdersPage: React.FC = () => {
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      return await ordersApi.getAll();
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      if (!editOrder || !editForm) return;
      if (!editForm.orderNumber || !editForm.customerEmail || !editForm.currency) {
        throw new Error('All fields are required');
      }
      return await ordersApi.update(editOrder._id, editForm);
    },
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditOrder(null);
      setEditForm(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Commande modifiée', description: 'La commande a été mise à jour.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await ordersApi.delete(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Commande supprimée', description: 'La commande a été supprimée.' });
      setDeleteDialogOpen(null);
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return await ordersApi.updateStatus({ orderId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Succès', description: 'Le statut de la commande a été mis à jour.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: `Une erreur est survenue: ${error.message}`, variant: 'destructive' });
    },
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: PaymentStatus }) => {
      return await ordersApi.updateStatus({ orderId, paymentStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Succès', description: 'Le statut du paiement a été mis à jour.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: `Une erreur est survenue: ${error.message}`, variant: 'destructive' });
    },
  });

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ orderId, status: 'paid' });
    } catch (error) {
      console.error('Payment success handling error:', error);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const searchMatch = filters.search
        ? order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const statusMatch = filters.status === 'all' ? true : order.status === filters.status;
      const paymentMatch = filters.paymentStatus === 'all' ? true : order.paymentStatus === filters.paymentStatus;
      return searchMatch && statusMatch && paymentMatch;
    });
  }, [orders, filters]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" aria-label="Chargement des commandes" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-destructive">Une erreur est survenue lors du chargement des commandes.</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
          variant="outline"
          aria-label="Réessayer de charger les commandes"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
          <CardDescription>Gérez les commandes de votre boutique</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <div className="flex gap-2">
              <ExportButton orders={filteredOrders} format="excel" />
              <ExportButton orders={filteredOrders} format="csv" />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une commande..."
                value={filters.search}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="flex-1"
                aria-label="Rechercher une commande par numéro ou email"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value: OrderStatus | 'all') =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-[200px]" aria-label="Filtrer par statut de commande">
                <SelectValue placeholder="Statut de commande" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value: PaymentStatus | 'all') =>
                setFilters({ ...filters, paymentStatus: value })
              }
            >
              <SelectTrigger className="w-[200px]" aria-label="Filtrer par statut de paiement">
                <SelectValue placeholder="Statut de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les paiements</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Aucune commande"
              description="Vous n'avez pas encore reçu de commande. Partagez votre boutique pour commencer à vendre !"
              illustration={<EmptyCartIllustration />}
            />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livreur</TableHead>
                <TableHead>Transporteur</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order: Order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{order.customerEmail}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: order.currency || 'EUR', // Fallback to EUR
                    }).format(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusUpdateButton
                      type="order"
                      currentStatus={order.status}
                      onUpdateStatus={async (status) =>
                        await updateOrderStatus.mutateAsync({ orderId: order._id, status: status as OrderStatus })
                      }
                      disabled={updateOrderStatus.isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <AssignDriverSelect
                      orderId={order._id}
                      orderStatus={order.status}
                      assignedDriverId={order.assignedDriverId}
                    />
                  </TableCell>
                  <TableCell>
                    <CreateShipmentPanel
                      orderId={order._id}
                      orderNumber={order.orderNumber}
                      hasTracking={Boolean(order.trackingNumber)}
                    />
                    {order.trackingNumber && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {order.trackingNumber}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusUpdateButton
                      type="payment"
                      currentStatus={order.paymentStatus}
                      onUpdateStatus={async (status) =>
                        await updatePaymentStatus.mutateAsync({ orderId: order._id, status: status as PaymentStatus })
                      }
                      disabled={updatePaymentStatus.isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <GenerateInvoiceButton order={order} />
                      {order.paymentStatus === 'pending' && (
                        <StripePaymentButton
                          order={order}
                          onSuccess={() => handlePaymentSuccess(order._id)}
                          onError={(error: Error) => {
                            toast({
                              title: 'Erreur de paiement',
                              description: error.message,
                              variant: 'destructive',
                            });
                          }}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditOrder(order);
                          setEditForm({
                            orderNumber: order.orderNumber,
                            customerEmail: order.customerEmail,
                            total: order.total,
                            currency: order.currency,
                          });
                          setEditDialogOpen(true);
                        }}
                        aria-label={`Modifier la commande ${order.orderNumber}`}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(order._id)}
                        disabled={deleteOrderMutation.isPending}
                        aria-label={`Supprimer la commande ${order.orderNumber}`}
                      >
                        {deleteOrderMutation.isPending && deleteDialogOpen === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Supprimer'
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}

          {filteredOrders.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div>
              Affichage de {Math.min((page - 1) * itemsPerPage + 1, filteredOrders.length)} à{' '}
              {Math.min(page * itemsPerPage, filteredOrders.length)} sur {filteredOrders.length} commandes
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Page précédente"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Page suivante"
              >
                Suivant
              </Button>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent aria-labelledby="edit-dialog-title" aria-describedby="edit-dialog-description">
          <DialogHeader>
            <DialogTitle id="edit-dialog-title">Modifier la commande</DialogTitle>
            <DialogDescription id="edit-dialog-description">
              Éditez les informations de la commande.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-4">
              <Input
                placeholder="Numéro de commande"
                value={editForm.orderNumber}
                onChange={(e) => setEditForm((p) => ({ ...p!, orderNumber: e.target.value }))}
                aria-label="Numéro de commande"
              />
              <Input
                placeholder="Email client"
                value={editForm.customerEmail}
                onChange={(e) => setEditForm((p) => ({ ...p!, customerEmail: e.target.value }))}
                aria-label="Email du client"
              />
              <Input
                placeholder="Total (€)"
                type="number"
                value={editForm.total}
                onChange={(e) => setEditForm((p) => ({ ...p!, total: Number(e.target.value) }))}
                aria-label="Total de la commande"
              />
              <Input
                placeholder="Devise"
                value={editForm.currency}
                onChange={(e) => setEditForm((p) => ({ ...p!, currency: e.target.value }))}
                aria-label="Devise de la commande"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              aria-label="Annuler la modification"
            >
              Annuler
            </Button>
            <Button
              onClick={() => updateOrderMutation.mutate()}
              disabled={
                !editForm?.orderNumber ||
                !editForm?.customerEmail ||
                !editForm?.currency ||
                updateOrderMutation.isPending
              }
              aria-label="Enregistrer les modifications"
            >
              {updateOrderMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <DialogContent aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
          <DialogHeader>
            <DialogTitle id="delete-dialog-title">Confirmer la suppression</DialogTitle>
            <DialogDescription id="delete-dialog-description">
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(null)}
              aria-label="Annuler la suppression"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialogOpen && deleteOrderMutation.mutate(deleteDialogOpen)}
              disabled={deleteOrderMutation.isPending}
              aria-label="Confirmer la suppression"
            >
              {deleteOrderMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;