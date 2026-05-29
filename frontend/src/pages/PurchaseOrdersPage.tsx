import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi } from '@/lib/purchaseOrdersApi';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PurchaseOrder, CreatePurchaseOrderInput } from '@/types/purchaseOrder';

const PurchaseOrdersPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ financingRequestId: '', amount: '', details: '' });
  const [submitting, setSubmitting] = useState(false);

  // Liste des bons de commande
  const { data: orders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrdersApi.getAll,
    staleTime: 60_000,
  });

  // Création d'un bon de commande
  const createMutation = useMutation({
    mutationFn: async () => {
      const input: CreatePurchaseOrderInput = {
        financingRequestId: form.financingRequestId,
        amount: Number(form.amount),
        details: form.details ? { description: form.details } : undefined
      };
      return await purchaseOrdersApi.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({ title: 'Bon de commande créé' });
      setForm({ financingRequestId: '', amount: '', details: '' });
      setSubmitting(false);
    },
    onError: (e: Error) => {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      setSubmitting(false);
    }
  });

  const handleSubmit = () => {
    setSubmitting(true);
    createMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Planification d'Achat</h1>
      <Card>
        <CardHeader>
          <CardTitle>Nouveau bon de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input 
              placeholder="ID Financement" 
              value={form.financingRequestId} 
              onChange={e => setForm(f => ({ ...f, financingRequestId: e.target.value }))} 
            />
            <Input 
              type="number" 
              min={0} 
              placeholder="Montant (€)" 
              value={form.amount} 
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
            />
            <Input 
              placeholder="Description" 
              value={form.details} 
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))} 
            />
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !form.financingRequestId || !form.amount}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Créer
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historique des bons de commande</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <ul className="space-y-2">
              {orders.map((po) => (
                <li key={po._id} className="p-2 border rounded">
                  <div>Montant : {po.amount} € | Statut : {po.status}</div>
                  <div>Financement : {po.financingRequestId}</div>
                  <div>Créé le : {new Date(po.createdAt).toLocaleDateString()}</div>
                  <div>Description : {po.details?.description}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrdersPage;