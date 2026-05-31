import React from 'react';
import { Clock, Shield, Truck } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  truck: Truck,
  shield: Shield,
  clock: Clock,
};

type TrustBadge = { id: string; label: string; icon: string };

type CheckoutTrustBadgesProps = {
  badges?: TrustBadge[];
  className?: string;
};

const DEFAULT_BADGES: TrustBadge[] = [
  { id: 'cod', label: 'Paiement à la livraison', icon: 'truck' },
  { id: 'secure', label: 'Commande sécurisée SMS', icon: 'shield' },
  { id: 'fast', label: 'Livraison 24-72h', icon: 'clock' },
];

export const CheckoutTrustBadges: React.FC<CheckoutTrustBadgesProps> = ({
  badges = DEFAULT_BADGES,
  className = '',
}) => (
  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${className}`}>
    {badges.map((badge) => {
      const Icon = ICONS[badge.icon] || Shield;
      return (
        <div
          key={badge.id}
          className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
        >
          <Icon className="h-4 w-4 shrink-0 text-primary" />
          <span>{badge.label}</span>
        </div>
      );
    })}
  </div>
);
