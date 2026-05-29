import React from 'react';
import { cn } from '@/lib/utils';
import type { TrackingEvent } from '../types/delivery.types';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

type Props = { events: TrackingEvent[] };

export const ShipmentTimeline: React.FC<Props> = ({ events }) => {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  if (!sorted.length) {
    return <p className="text-sm text-muted-foreground">Aucun événement de suivi.</p>;
  }

  return (
    <ol className="relative border-l border-border/80 ml-3 space-y-6">
      {sorted.map((ev, i) => (
        <li key={`${ev.status}-${ev.occurredAt}-${i}`} className="ml-6">
          <span
            className={cn(
              'absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-background',
              i === 0 ? 'bg-primary' : 'bg-muted-foreground/40',
            )}
          />
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <ShipmentStatusBadge status={ev.status} />
            <time className="text-xs text-muted-foreground">
              {new Date(ev.occurredAt).toLocaleString('fr-TN')}
            </time>
          </div>
          {ev.location && (
            <p className="text-sm text-muted-foreground">{ev.location}</p>
          )}
          {ev.description && (
            <p className="text-sm text-foreground/80 mt-0.5">{ev.description}</p>
          )}
        </li>
      ))}
    </ol>
  );
};
