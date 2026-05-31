import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Package,
  PackageCheck,
  TrendingUp,
  Settings,
  Store,
  Moon,
  Sun,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SAAS_TAGLINE } from '@/content/saas-launch';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import { cn } from '@/lib/utils';

const MAIN_NAV = [
  { icon: Home, labelKey: 'nav.dashboard', path: '/dashboard' },
  { icon: Store, labelKey: 'nav.store', path: '/website' },
  { icon: ShoppingBag, labelKey: 'nav.orders', path: '/orders' },
  { icon: Package, labelKey: 'nav.products', path: '/products' },
  { icon: PackageCheck, labelKey: 'nav.delivery', path: '/delivery' },
  { icon: TrendingUp, labelKey: 'nav.recovery', path: '/conversion/center' },
  { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
] as const;

const ModernSidebar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [websiteSlug, setWebsiteSlug] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/website')
      .then((r) => {
        if (r.data?.slug) setWebsiteSlug(r.data.slug);
      })
      .catch(() => {});
  }, []);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            EP
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight">EcomPilot</h2>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{SAAS_TAGLINE}</p>
          </div>
        </div>
        <Badge variant="secondary" className="mt-3 w-full justify-center text-[10px] font-normal">
          {t('nav.freeGrowthBadge')}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Navigation principale">
        <ul className="space-y-0.5">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} aria-hidden />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {websiteSlug ? (
          <Button variant="outline" size="sm" className="w-full justify-between" asChild>
            <a href={`/store/${websiteSlug}`} target="_blank" rel="noopener noreferrer">
              {t('common.viewStore')}
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </Button>
        ) : (
          <Button variant="default" size="sm" className="w-full" asChild>
            <Link to="/website">{t('nav.store')}</Link>
          </Button>
        )}

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              api.post('/auth/profile/preferences', { darkMode: next === 'dark' }).catch(() => {});
            }}
            className="flex-1 gap-2"
            aria-label={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-xs">{theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default ModernSidebar;
