import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { merchantApiKeys } from '@/lib/merchantApiKeys';
import { Key, Loader2 } from 'lucide-react';

export function MerchantApiKeysPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['merchant-api-keys'],
    queryFn: merchantApiKeys.list,
  });

  const createMutation = useMutation({
    mutationFn: () => merchantApiKeys.create(name || 'API'),
    onSuccess: (data) => {
      setFreshKey(data.key);
      setName('');
      queryClient.invalidateQueries({ queryKey: ['merchant-api-keys'] });
      toast({ title: t('apiKeys.generated') });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => merchantApiKeys.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-api-keys'] });
      toast({ title: t('apiKeys.revoked') });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          {t('apiKeys.title')}
        </CardTitle>
        <CardDescription>{t('apiKeys.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {freshKey && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-medium mb-1">{t('apiKeys.copyOnce')}</p>
            <code className="block break-all text-xs">{freshKey}</code>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFreshKey(null)}>
              OK
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('apiKeys.namePlaceholder')}
          />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('apiKeys.generate')}
          </Button>
        </div>

        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('apiKeys.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-2 border rounded-lg p-3 text-sm">
                <div>
                  <p className="font-medium">{k.name}</p>
                  <p className="text-muted-foreground">
                    {t('apiKeys.prefix')}: {k.keyPrefix}… · {t('apiKeys.created')}{' '}
                    {new Date(k.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeMutation.mutate(k.id)}
                  disabled={revokeMutation.isPending}
                >
                  {t('apiKeys.revoke')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
