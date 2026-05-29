import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FinancingDashboard, SimulationResult } from '@/types/financing';
import { financingApi } from '@/lib/financingApi';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FinancingPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sales, setSales] = useState('');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [amountRequested, setAmountRequested] = useState('');

  // Dashboard financier
  const { data: dashboard, isLoading } = useQuery<FinancingDashboard>({
    queryKey: ['financing-dashboard'],
    queryFn: () => financingApi.getDashboard(),
    staleTime: 60_000,
  });

  // Simulation RBF
  const simulateMutation = useMutation({
    mutationFn: async () => {
      return await financingApi.simulate({
        salesHistory: { totalSales: Number(sales) }
      });
    },
    onSuccess: (result) => {
      setSimResult(result);
      setAmountRequested(result.amountRequested.toString());
    },
    onError: (e: Error) => {
      toast({ 
        title: 'Erreur de simulation', 
        description: e.message, 
        variant: 'destructive' 
      });
    }
  });

  // Demande de financement
  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!simResult) throw new Error("Veuillez d'abord effectuer une simulation");
      
      return await financingApi.request({
        amountRequested: Number(amountRequested),
        rbfRate: simResult.rbfRate,
        salesHistory: { totalSales: Number(sales) }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing-dashboard'] });
      toast({ 
        title: 'Demande envoyée', 
        description: 'Votre demande de financement est en cours de traitement.' 
      });
      // Réinitialiser le formulaire
      setSales('');
      setSimResult(null);
      setAmountRequested('');
    },
    onError: (e: Error) => {
      toast({ 
        title: 'Erreur', 
        description: e.message, 
        variant: 'destructive' 
      });
    }
  });

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Financement RBF</h1>
      <Card>
        <CardHeader>
          <CardTitle>Simulateur d'avance de fonds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <Input type="number" min={0} placeholder="Total ventes (€)" value={sales} onChange={e => setSales(e.target.value)} />
            <Button 
              onClick={() => simulateMutation.mutate()} 
              disabled={!sales || isNaN(Number(sales)) || simulateMutation.isPending}
            >
              {simulateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simuler
            </Button>
          </div>
          {simResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div>Montant proposé : <b>{simResult.amountRequested} €</b></div>
              <div>Taux RBF : <b>{(simResult.rbfRate * 100).toFixed(2)}%</b></div>
              <div>Ventes analysées : <b>{simResult.totalSales} €</b></div>
              <div className="mt-2">
                <Input type="number" min={0} placeholder="Montant demandé (€)" value={amountRequested} onChange={e => setAmountRequested(e.target.value)} />
                <Button 
                  className="mt-2" 
                  onClick={() => requestMutation.mutate()} 
                  disabled={requestMutation.isPending || !amountRequested || isNaN(Number(amountRequested))}
                >
                  {requestMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Demander l'avance
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord financier</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <div>
              {dashboard?.active ? (
                <div className="mb-4 p-4 bg-green-50 rounded">
                  <div>Financement actif : <b>{dashboard.active.amountRequested} €</b></div>
                  <div>Statut : <b>{dashboard.active.status}</b></div>
                  <div>Remboursement : <b>{dashboard.active.repayment?.percentRepaid ?? 0}%</b></div>
                </div>
              ) : <div className="mb-4">Aucun financement actif</div>}
              <div className="font-semibold mb-2">Historique des demandes</div>
              <ul className="space-y-2">
                {dashboard?.requests?.map((r) => (
                  <li key={r._id} className="p-2 border rounded">
                    <div>Montant : {r.amountRequested} € | Statut : {r.status}</div>
                    <div>Demandé le : {new Date(r.createdAt).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancingPage;
