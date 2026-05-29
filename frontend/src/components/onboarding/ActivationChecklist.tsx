import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ONBOARDING_TASKS, PRICING_PLANS } from '@/content/saas-launch';
import { fetchDeliveryProviders, fetchDeliveryShipments } from '@/modules/delivery/services/deliveryApi';
import { ordersApi } from '@/lib/api';
import { PLAN_KEY } from '@/pages/onboarding/ActivationFlowPage';

export const ActivationChecklist: React.FC = () => {
  const planId = localStorage.getItem(PLAN_KEY) || 'starter';
  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0];

  const { data: providers = [] } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });
  const { data: shipments = [] } = useQuery({
    queryKey: ['delivery-shipments'],
    queryFn: () => fetchDeliveryShipments(),
  });

  const done = {
    'connect-carrier': providers.some((p) => p.configured),
    'first-order': orders.length > 0,
    'first-shipment': shipments.length > 0,
  };

  const completedCount = ONBOARDING_TASKS.filter((t) => done[t.id as keyof typeof done]).length;
  const progress = Math.round((completedCount / ONBOARDING_TASKS.length) * 100);

  if (progress === 100) return null;

  const [dismissed, setDismissed] = React.useState(
    () => localStorage.getItem('ecompilot_checklist_dismiss') === '1',
  );

  if (dismissed) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Activez votre compte</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Plan {plan.name} ({plan.price} DT/mois) — {progress}% complété
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => {
            localStorage.setItem('ecompilot_checklist_dismiss', '1');
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <ul className="space-y-2">
          {ONBOARDING_TASKS.map((task) => {
            const isDone = done[task.id as keyof typeof done];
            return (
              <li key={task.id}>
                <Link
                  to={task.route}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/60 transition-colors"
                >
                  {isDone ? (
                    <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
