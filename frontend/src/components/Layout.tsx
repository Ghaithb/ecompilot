import React from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { LogOut, LayoutDashboard, Package, ShoppingCart, Bot, BarChart3, Shield, Link as LinkIcon, ChevronDown, User, Settings, Globe, Megaphone, DollarSign, Bell, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import CurrencySelector from './CurrencySelector';
import LanguageSelector from './LanguageSelector';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const directNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Produits', href: '/products', icon: Package },
    { name: 'Commandes', href: '/orders', icon: ShoppingCart },
    { name: 'IA Copilot', href: '/ai-copilot', icon: Bot },
  ] as Array<{ name: string; href: string; icon: React.ElementType }>;

  const groupedNav: Array<{ label: string; items: Array<{ name: string; href: string; icon: React.ElementType }> }> = [
    {
      label: 'Gestion',
      items: [
        { name: 'Inventaire', href: '/inventory', icon: Package },
        { name: 'Ordres d\'Achat', href: '/purchase-orders', icon: ShoppingCart },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Alertes', href: '/alerts', icon: Shield },
      ],
    },
    {
      label: 'Site Web',
      items: [
        { name: 'Gestion du Site', href: '/website', icon: Globe },
      ],
    },
    {
      label: 'Connexions',
      items: [
        { name: 'Intégrations', href: '/integrations', icon: LinkIcon },
        { name: 'Marketing', href: '/marketing', icon: Megaphone },
        { name: 'Financement', href: '/financing', icon: DollarSign },
      ],
    },
    {
      label: 'Paramètres',
      items: [
        { name: 'Mon Compte', href: '/profile', icon: User },
        { name: 'Devises & Tarifs', href: '/currency-settings', icon: DollarSign },
        { name: 'WhatsApp Business', href: '/whatsapp-settings', icon: MessageSquare },
        { name: 'Notifications', href: '/notifications-settings', icon: Bell },
      ],
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b border-border backdrop-blur-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between h-14">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-base font-bold text-foreground">EcomPilot</h1>
              </div>
              <div className="hidden sm:ml-4 sm:flex sm:items-center sm:gap-2">
                {directNav.map((item) => (
                  <RouterLink
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    } whitespace-nowrap px-2 py-1 font-medium text-sm inline-flex items-center gap-1.5 transition-colors`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </RouterLink>
                ))}

                {groupedNav.map((group) => (
                  <DropdownMenu key={group.label}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2 py-1 h-8">
                        {group.label}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {group.items.map((it) => (
                        <DropdownMenuItem key={it.name} asChild>
                          <RouterLink to={it.href} className="inline-flex items-center gap-2">
                            <it.icon className="w-4 h-4" />
                            {it.name}
                          </RouterLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}

                {user?.roles?.includes('admin') && (
                  <RouterLink
                    to="/admin/users"
                    className={`${
                      isActive('/admin/users') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                    } whitespace-nowrap px-2 py-1 font-medium text-sm inline-flex items-center gap-1.5 transition-colors`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </RouterLink>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language and Currency Selectors */}
              <div className="hidden lg:flex items-center gap-2">
                <LanguageSelector />
                <CurrencySelector />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 hover:bg-accent">
                    <Avatar className="w-7 h-7 bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Avatar>
                    <span className="hidden sm:inline text-sm text-foreground">{user?.firstName}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <RouterLink to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Mon Profil
                    </RouterLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <RouterLink to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </RouterLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;