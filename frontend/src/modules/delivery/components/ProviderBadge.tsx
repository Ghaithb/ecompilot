import React from 'react';
import { cn } from '@/lib/utils';
import { PROVIDER_LABELS, type DeliveryProviderId } from '../services/deliveryApi';

const PROVIDER_STYLES: Record<DeliveryProviderId, string> = {
  intigo: 'bg-violet-100 text-violet-800 border-violet-200',
  first_delivery: 'bg-sky-100 text-sky-800 border-sky-200',
  shipper: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

type ProviderBadgeProps = {
  provider: DeliveryProviderId | string;
  className?: string;
};

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({ provider, className }) => {
  const id = provider as DeliveryProviderId;
  const label = PROVIDER_LABELS[id] || String(provider).replace(/_/g, ' ');
  const style = PROVIDER_STYLES[id] || 'bg-muted text-muted-foreground border-border';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {label}
    </span>
  );
};
