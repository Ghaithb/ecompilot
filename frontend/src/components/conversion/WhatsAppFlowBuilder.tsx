import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { GitBranch, MessageCircle, Clock, Smartphone } from 'lucide-react';

type FlowStep = {
  id: string;
  type: 'wait_hours' | 'send_whatsapp' | 'send_sms';
  label: string;
  params: { hours?: number; message?: string; template?: string };
};

type WhatsAppFlow = {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  steps: FlowStep[];
};

const STEP_ICONS = {
  wait_hours: Clock,
  send_whatsapp: MessageCircle,
  send_sms: Smartphone,
};

export function WhatsAppFlowBuilder() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-flows'],
    queryFn: async () => {
      const { data: res } = await api.get<{ flows: WhatsAppFlow[] }>('/conversion/whatsapp-flows');
      return res.flows;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ flowId, enabled }: { flowId: string; enabled: boolean }) =>
      api.patch(`/conversion/whatsapp-flows/${flowId}`, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp-flows'] }),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground p-4">{t('common.loading')}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitBranch className="w-5 h-5 text-green-600" />
          {t('conversion.flowBuilder.title')}
        </CardTitle>
        <CardDescription>{t('conversion.flowBuilder.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(data ?? []).map((flow) => (
          <div key={flow.id} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{flow.name}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {t(`conversion.flowBuilder.triggers.${flow.trigger}`, { defaultValue: flow.trigger })}
                </Badge>
              </div>
              <Switch
                checked={flow.enabled}
                onCheckedChange={(enabled) => toggleMutation.mutate({ flowId: flow.id, enabled })}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {flow.steps.map((step, index) => {
                const Icon = STEP_ICONS[step.type] ?? MessageCircle;
                return (
                  <React.Fragment key={step.id}>
                    {index > 0 && <span className="text-muted-foreground text-xs">→</span>}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
                      <Icon className="w-3 h-3" />
                      {step.label}
                      {step.type === 'wait_hours' && step.params.hours != null && (
                        <span className="text-muted-foreground">({step.params.hours}h)</span>
                      )}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
