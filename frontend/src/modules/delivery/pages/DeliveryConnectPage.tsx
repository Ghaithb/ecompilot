import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryPageShell } from '../components/DeliveryPageShell';
import { ConnectProviderForm } from '../components/ConnectProviderForm';
import {
  fetchDeliveryProviders,
  fetchProviderCredentials,
  PROVIDER_LABELS,
} from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';

const MVP_IDS: DeliveryProviderId[] = ['intigo', 'first_delivery', 'shipper'];

const DeliveryConnectPage: React.FC = () => {
  const { data: providers = [] } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
  });

  const { data: credentials = [] } = useQuery({
    queryKey: ['delivery-credentials'],
    queryFn: fetchProviderCredentials,
  });

  return (
    <DeliveryPageShell
      title="Connecter un transporteur"
      description="Apportez votre propre clé API (BYO). Les tokens sont chiffrés et isolés par boutique."
    >
      <div className="space-y-6 max-w-2xl">
        {MVP_IDS.map((id) => {
          const meta = providers.find((p) => p.id === id);
          const cred = credentials.find((c) => c.provider === id);
          const configured = meta?.configured ?? cred?.hasToken;

          return (
            <Card key={id} className="border-border/60 shadow-sm overflow-hidden">
              <div
                className={
                  configured
                    ? 'h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600'
                    : 'h-0.5 bg-muted'
                }
              />
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{PROVIDER_LABELS[id]}</CardTitle>
                    <CardDescription className="mt-1">
                      {configured
                        ? 'Connexion active pour votre boutique'
                        : 'Ajoutez votre token pour activer les expéditions'}
                    </CardDescription>
                  </div>
                  {configured ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ConnectProviderForm
                  providerId={id}
                  configured={!!configured}
                  existingApiUrl={cred?.apiUrl}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DeliveryPageShell>
  );
};

export default DeliveryConnectPage;
