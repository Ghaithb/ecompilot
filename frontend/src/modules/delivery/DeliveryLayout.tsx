import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/delivery', label: 'Vue d\'ensemble', icon: LayoutDashboard, end: true },
  { to: '/delivery/shipments', label: 'Expéditions', icon: Package },
  { to: '/delivery/connect', label: 'Connecter', icon: Plug },
];

const DeliveryLayout: React.FC = () => (
  <div className="min-h-full flex flex-col">
    <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-xl">
      <div className="px-6 py-3 flex items-center gap-3 border-b border-border/50">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            EcomPilot
          </p>
          <p className="text-sm font-semibold">Delivery</p>
        </div>
      </div>
      <nav className="px-4 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
                isActive
                  ? 'text-primary bg-background border border-b-0 border-border shadow-sm -mb-px'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </NavLink>
        ))}
      </nav>
    </header>
    <Outlet />
  </div>
);

export default DeliveryLayout;
