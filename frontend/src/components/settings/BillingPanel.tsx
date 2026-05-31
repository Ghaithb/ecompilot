import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { billingApi } from '@/lib/billingApi';
import { CreditCard, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Free Growth Mode — accès complet, pas de checkout abonnement pour l'instant */
export function BillingPanel() {
  const { t } = useTranslation();

  const { data: sub, isLoading } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: billingApi.getSubscription,
  });

  if (isLoading || !sub) {
    return <Loader2 className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <div className="space-y-6">
      <Card className="saas-card border-l-4 border-l-[#2563EB] bg-gradient-to-br from-blue-50/80 to-background dark:from-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('billing.freeGrowthTitle')}
          </CardTitle>
          <CardDescription>{t('billing.freeGrowthDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className="mb-3">
            {sub.plan.name} · {t('billing.freeGrowthTitle')}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {t('billing.ordersThisMonth')}:{' '}
            <span className="font-semibold text-foreground">
              {sub.usage.ordersThisMonth}
              {sub.usage.ordersLimit > 0 ? ` / ${sub.usage.ordersLimit}` : ' · ∞'}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="saas-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5" />
            Paiements boutique (COD marchand)
          </CardTitle>
          <CardDescription>
            Konnect / Flouci pour vos clients — pas l&apos;abonnement EcomPilot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <Badge variant={sub.paymentMethods.konnect ? 'default' : 'secondary'}>Konnect</Badge>
            <Badge variant={sub.paymentMethods.flouci ? 'default' : 'secondary'}>Flouci</Badge>
            <Badge variant={sub.paymentMethods.cod ? 'default' : 'secondary'}>COD</Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/integrations">{t('billing.connectPayments')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
