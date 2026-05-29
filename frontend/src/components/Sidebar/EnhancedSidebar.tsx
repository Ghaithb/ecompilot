import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  Tag, 
  FileText, 
  Globe, 
  Calculator, 
  BarChart 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { QuickStats } from './QuickStats';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { HelpWidget } from './HelpWidget';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

export function EnhancedSidebar() {
  const location = useLocation();

  const mainMenu: MenuItem[] = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: ShoppingCart, label: 'Commandes', path: '/orders' },
    { icon: Package, label: 'Produits', path: '/products' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: TrendingUp, label: 'Marketing', path: '/marketing' },
    { icon: Tag, label: 'Réductions', path: '/promotions' },
    { icon: FileText, label: 'Contenu', path: '/content' },
    { icon: Globe, label: 'Markets', path: '/markets' },
    { icon: Calculator, label: 'Calculateur', path: '/calculator' },
    { icon: BarChart, label: 'Analyses', path: '/analytics' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            EC
          </div>
          <span className="font-bold text-lg text-gray-900">EcomPilot</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Menu */}
        <nav className="py-4">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Stats Widget */}
        <QuickStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity />

        {/* Help Widget */}
        <HelpWidget />

        {/* Bottom Sections */}
        <div className="px-4 py-3 border-t border-gray-200">
          <button className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 py-2">
            <span className="font-medium">CANAUX DE VENTE</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <button className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 py-2">
            <span className="font-medium">APPLICATIONS</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer - Paramètres */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/settings"
          className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Paramètres
        </Link>
      </div>
    </div>
  );
}
