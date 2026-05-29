import { Search, Bell, HelpCircle, Settings, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NavbarCenter } from './NavbarCenter';

export function EnhancedNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between gap-6">
        {/* Logo + Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EC</span>
            </div>
            <span className="font-bold text-xl text-gray-900">EcomPilot</span>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Rechercher produits, commandes, clients..."
                className="pl-10 pr-4"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
                Ctrl K
              </kbd>
            </div>
          </div>
        </div>

        {/* Center - Quick Stats */}
        <NavbarCenter />

        {/* Right - Icons & User */}
        <div className="flex items-center gap-2">
          {/* Guide */}
          <Button variant="ghost" size="icon" className="relative">
            <HelpCircle className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-xs text-gray-500">Vous avez 3 nouvelles notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="p-4 cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      🛍️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Nouvelle commande</p>
                      <p className="text-xs text-gray-600">Commande #1234 - 145.90€</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 5 min</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      ⚠️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Stock faible</p>
                      <p className="text-xs text-gray-600">Parfum Rose - 3 unités restantes</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 1h</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      ✅
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Paiement reçu</p>
                      <p className="text-xs text-gray-600">250.00€ crédité</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 2h</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" className="w-full">
                  Voir toutes les notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">abvbb</p>
                  <p className="text-xs text-gray-500">aabbbvvv@gmail.com</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
