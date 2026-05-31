import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AutomationRule = {
  _id: string;
  name: string;
  trigger: string;
  actions: Array<{ type: string }>;
  isActive: boolean;
};

export default function AutomationPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');

  const PRESETS = [
    { nameKey: 'whatsappConfirm', trigger: 'order.created', actions: [{ type: 'send_whatsapp' }] },
    { nameKey: 'notifyAdminDelay', trigger: 'shipment.delayed', actions: [{ type: 'notify_admin' }] },
    { nameKey: 'vipTag', trigger: 'order.delivered', actions: [{ type: 'assign_tag', params: { tag: 'vip' } }] },
    { nameKey: 'recoveryEmail', trigger: 'payment.failed', actions: [{ type: 'send_email' }] },
    { nameKey: 'autoShipment', trigger: 'order.created', actions: [{ type: 'create_shipment' }] },
  ] as const;

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automation', 'rules'],
    queryFn: async () => {
      const { data } = await api.get<AutomationRule[]>('/automation/rules');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; trigger: string; actions: Array<{ type: string; params?: Record<string, unknown> }> }) =>
      api.post('/automation/rules', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'rules'] });
      toast({ title: t('automation.ruleCreated') });
      setNewName('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/automation/rules/${id}/toggle`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation', 'rules'] }),
  });

  const triggerLabel = (key: string) =>
    t(`automation.triggers.${key}`, { defaultValue: key });

  return (
    <div className="w-full px-6 py-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-7 h-7 text-primary" />
          {t('automation.title')}
        </h1>
        <p className="text-muted-foreground mt-1">{t('automation.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('automation.presetsTitle')}</CardTitle>
          <CardDescription>{t('automation.presetsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.nameKey}
              variant="outline"
              className="h-auto py-3 justify-start text-left"
              onClick={() =>
                createMutation.mutate({
                  name: t(`automation.presets.${preset.nameKey}`),
                  trigger: preset.trigger,
                  actions: [...preset.actions],
                })
              }
              disabled={createMutation.isPending}
            >
              <div>
                <p className="font-medium">{t(`automation.presets.${preset.nameKey}`)}</p>
                <p className="text-xs text-muted-foreground">{triggerLabel(preset.trigger)}</p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('automation.activeRules')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t('automation.noRules')}</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule._id} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {triggerLabel(rule.trigger)} → {rule.actions.map((a) => a.type).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? t('automation.active') : t('automation.paused')}
                    </Badge>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: rule._id, isActive: checked })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('automation.customRule')}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder={t('automation.ruleNamePlaceholder')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            disabled={!newName.trim() || createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                name: newName,
                trigger: 'order.created',
                actions: [{ type: 'notify_admin' }],
              })
            }
          >
            {t('automation.create')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
