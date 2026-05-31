import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type IntegrationStatus = 'live' | 'pilot' | 'coming-soon';

const STATUS_STYLES: Record<IntegrationStatus, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pilot: 'bg-amber-50 text-amber-800 border-amber-200',
  'coming-soon': 'bg-muted text-muted-foreground border-border',
};

export function IntegrationStatusBadge({
  status,
  className,
}: {
  status: IntegrationStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  const labelKey = `integrations.status.${status === 'coming-soon' ? 'comingSoon' : status}` as const;

  return (
    <Badge variant="outline" className={cn('font-medium', STATUS_STYLES[status], className)}>
      {t(labelKey)}
    </Badge>
  );
}
