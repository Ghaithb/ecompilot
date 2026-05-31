import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, Truck, Package, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ACTIVATION_STEPS,
  PRICING_PLANS,
  type PlanId,
} from '@/content/saas-launch';
import {
  fetchDeliveryProviders,
  fetchDeliveryShipments,
} from '@/modules/delivery/services/deliveryApi';
import { pilotsApi } from '@/lib/pilotsApi';
import { ordersApi } from '@/lib/api';

const PLAN_KEY = 'ecompilot_plan';
const ACTIVATION_KEY = 'ecompilot_activation_done';
const PILOT_KEY = 'ecompilot_pilot';

const ActivationFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanId>(() => {
    const saved = localStorage.getItem(PLAN_KEY);
    return saved === 'pro' ? 'pro' : 'starter';
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
    enabled: step >= 1,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    enabled: step >= 2,
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ['delivery-shipments'],
    queryFn: () => fetchDeliveryShipments(),
    enabled: step >= 2,
  });

  const carrierConnected = providers.some((p) => p.configured);
  const hasOrder = orders.length > 0;
  const hasShipment = shipments.length > 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPlan = params.get('plan');
    if (urlPlan === 'starter' || urlPlan === 'pro') {
      setPlan(urlPlan);
      localStorage.setItem(PLAN_KEY, urlPlan);
    }
    if (params.get('pilot') === '1') {
      localStorage.setItem(PILOT_KEY, '1');
    }
  }, []);

  const selectPlan = (id: PlanId) => {
    setPlan(id);
    localStorage.setItem(PLAN_KEY, id);
  };

  const finish = async () => {
    if (localStorage.getItem(PILOT_KEY) === '1') {
      try {
        await pilotsApi.enroll('activation');
      } catch {
        /* slots full or already enrolled */
      }
      localStorage.removeItem(PILOT_KEY);
    }
    localStorage.setItem(ACTIVATION_KEY, 'true');
    localStorage.setItem(PLAN_KEY, plan);
    navigate('/dashboard', { replace: true });
  };

  const progress = ((step + 1) / ACTIVATION_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <header className="border-b bg-card/80 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <span className="font-semibold">Activation EcomPilot</span>
          </div>
          <Button variant="ghost" size="sm" onClick={finish}>
            Passer au dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Étape {step + 1} / {ACTIVATION_STEPS.length} — {ACTIVATION_STEPS[step].title}
          </p>
        </div>

        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Choisissez votre offre
              </CardTitle>
              <CardDescription>
                14 jours d&apos;essai. Facturation manuelle (virement) — pas de carte requise aujourd&apos;hui.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PRICING_PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPlan(p.id)}
                  className={cn(
                    'w-full text-left rounded-xl border p-5 transition-all',
                    plan === p.id
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'hover:border-muted-foreground/30',
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                    <p className="text-xl font-semibold">
                      {p.price} <span className="text-sm font-normal text-muted-foreground">DT/mois</span>
                    </p>
                  </div>
                  {plan === p.id && (
                    <Check className="h-5 w-5 text-primary mt-3" />
                  )}
                </button>
              ))}
              <Button className="w-full" onClick={() => setStep(1)}>
                Continuer avec {plan === 'pro' ? 'Pro' : 'Starter'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Connecter un transporteur
              </CardTitle>
              <CardDescription>{ACTIVATION_STEPS[1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrierConnected ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-lg p-4 text-sm">
                  <Check className="h-5 w-5" />
                  Transporteur connecté — vous pouvez expédier.
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ajoutez votre token API sur la page Connecter (BYO — vos clés restent chiffrées).
                </p>
              )}
              <Button asChild variant={carrierConnected ? 'outline' : 'default'} className="w-full">
                <Link to="/delivery/connect" target="_blank" rel="noreferrer">
                  {carrierConnected ? 'Gérer les connexions' : 'Connecter maintenant'}
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Retour
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)} disabled={!carrierConnected}>
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Première expédition
              </CardTitle>
              <CardDescription>{ACTIVATION_STEPS[2].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className={cn('flex items-center gap-2', hasOrder && 'text-emerald-600')}>
                  {hasOrder ? <Check className="h-4 w-4" /> : <span className="w-4" />}
                  Au moins 1 commande
                </li>
                <li className={cn('flex items-center gap-2', hasShipment && 'text-emerald-600')}>
                  {hasShipment ? <Check className="h-4 w-4" /> : <span className="w-4" />}
                  Au moins 1 expédition créée
                </li>
              </ul>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline">
                  <Link to="/orders">Créer / voir commandes</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/delivery/shipments">Créer expédition</Link>
                </Button>
              </div>
              <Button className="w-full" onClick={finish}>
                Accéder au dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                Retour
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ActivationFlowPage;

export { ACTIVATION_KEY, PLAN_KEY, PILOT_KEY };
