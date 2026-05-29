import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** En-tête type Stripe Dashboard */
export const DeliveryPageShell: React.FC<Props> = ({
  title,
  description,
  actions,
  children,
  className,
}) => (
  <div className={cn('min-h-full bg-gradient-to-b from-muted/30 to-background', className)}>
    <div className="border-b bg-card/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1.5 text-sm max-w-xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
  </div>
);
