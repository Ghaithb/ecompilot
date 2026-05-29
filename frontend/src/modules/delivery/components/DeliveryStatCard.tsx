import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  value: string | number;
  hint?: string;
};

export const DeliveryStatCard: React.FC<Props> = ({ title, value, hint }) => (
  <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <p className={cn('text-3xl font-semibold tracking-tight mt-2 tabular-nums')}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </CardContent>
  </Card>
);
