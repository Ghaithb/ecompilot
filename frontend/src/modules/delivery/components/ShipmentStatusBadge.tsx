import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  created: 'bg-slate-100 text-slate-700 border-slate-200',
  in_transit: 'bg-blue-50 text-blue-700 border-blue-200',
  out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refused: 'bg-amber-50 text-amber-800 border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
  created: 'Créé',
  in_transit: 'En transit',
  out_for_delivery: 'En livraison',
  delivered: 'Livré',
  refused: 'Refusé',
  cancelled: 'Annulé',
  updated: 'Mis à jour',
};

type Props = { status: string; className?: string };

export const ShipmentStatusBadge: React.FC<Props> = ({ status, className }) => {
  const key = status?.toLowerCase().replace(/\s+/g, '_') || 'created';
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize border',
        STATUS_STYLES[key] || STATUS_STYLES.created,
        className,
      )}
    >
      {STATUS_LABELS[key] || status}
    </Badge>
  );
};
