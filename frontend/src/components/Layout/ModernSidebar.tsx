import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  PackageCheck,
  Settings,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { SAAS_TAGLINE } from '@/content/saas-launch';

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const MENU: MenuItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingBag, label: 'Commandes', path: '/orders' },
  { icon: PackageCheck, label: 'Livraison', path: '/delivery' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

const ModernSidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [websiteSlug, setWebsiteSlug] = useState<string | null>(null);

  useEffect(() => {
    api.get('/website').then((r) => {
      if (r.data?.slug) setWebsiteSlug(r.data.slug);
    }).catch(() => {});
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">EP</div>
          <div>
            <h2>EcomPilot</h2>
            <p className="text-[10px] text-muted-foreground leading-tight max-w-[140px]">
              {SAAS_TAGLINE}
            </p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {MENU.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {websiteSlug && (
          <a
            href={`/store/${websiteSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-primary px-4 py-2 block"
          >
            Voir boutique →
          </a>
        )}
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
          {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
        </Button>
      </div>
    </div>
  );
};

export default ModernSidebar;
