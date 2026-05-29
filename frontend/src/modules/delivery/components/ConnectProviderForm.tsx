import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plug, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  saveProviderCredential,
  testProviderConnection,
  PROVIDER_DESCRIPTIONS,
  PROVIDER_LABELS,
} from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';

type Props = {
  providerId: DeliveryProviderId;
  configured: boolean;
  existingApiUrl?: string | null;
};

export const ConnectProviderForm: React.FC<Props> = ({
  providerId,
  configured,
  existingApiUrl,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [token, setToken] = useState('');
  const [apiUrl, setApiUrl] = useState(existingApiUrl || '');
  const [label, setLabel] = useState('');

  const saveMutation = useMutation({
    mutationFn: () =>
      saveProviderCredential({
        provider: providerId,
        token,
        apiUrl: apiUrl || undefined,
        label: label || undefined,
      }),
    onSuccess: () => {
      setToken('');
      queryClient.invalidateQueries({ queryKey: ['delivery-providers'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-overview'] });
      toast({ title: 'Clé enregistrée', description: `${PROVIDER_LABELS[providerId]} connecté.` });
    },
    onError: (e: Error) =>
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const testMutation = useMutation({
    mutationFn: () => testProviderConnection(providerId),
    onSuccess: (res) =>
      toast({
        title: res.ok ? 'Connexion OK' : 'Échec',
        description: res.message,
        variant: res.ok ? 'default' : 'destructive',
      }),
    onError: (e: Error) =>
      toast({ title: 'Test impossible', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-muted-foreground">{PROVIDER_DESCRIPTIONS[providerId]}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`token-${providerId}`}>Clé API (Bearer)</Label>
          <Input
            id={`token-${providerId}`}
            type="password"
            placeholder={configured ? '•••••••• (laisser vide pour conserver)' : 'Collez votre token'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`url-${providerId}`}>URL API (optionnel)</Label>
          <Input
            id={`url-${providerId}`}
            placeholder="https://api..."
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`label-${providerId}`}>Libellé</Label>
          <Input
            id={`label-${providerId}`}
            placeholder="Production"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        Token chiffré côté serveur — jamais exposé en clair.
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!token.trim() || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plug className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
        <Button
          variant="outline"
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isPending || (!configured && !token.trim())}
        >
          {testMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Tester la connexion
        </Button>
      </div>
    </div>
  );
};
