import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Moon,
  Sun,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
  collapsible?: boolean;
}

const ModernSidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Boutique']);
  const [websiteSlug, setWebsiteSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await api.get('/website');
        if (response.data?.slug) setWebsiteSlug(response.data.slug);
      } catch (error: any) {
        if (error.response?.status !== 404) console.error(error);
      }
    };
    fetchWebsite();
  }, []);

  const menuSections: MenuSection[] = [
    {
      items: [
        { icon: Home, label: 'Accueil', path: '/dashboard' },
        { icon: ShoppingBag, label: 'Commandes', path: '/orders' },
        { icon: Package, label: 'Produits', path: '/products' },
        { icon: Users, label: 'Clients', path: '/customers' },
      ],
    },
    {
      title: 'Conversion',
      collapsible: true,
      items: [
        { icon: Zap, label: 'Centre conversion', path: '/conversion' },
        { icon: MessageCircle, label: 'WhatsApp', path: '/whatsapp-settings' },
        { icon: Tag, label: 'Coupons', path: '/discounts' },
      ],
    },
    {
      title: 'Boutique',
      collapsible: true,
      items: [
        { icon: Globe, label: 'Ma boutique', path: '/website' },
        { icon: Settings, label: 'Paramètres', path: '/settings' },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title],
    );
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">EC</div>
          <span className="logo-text">EcomPilot</span>
        </div>
        <p className="text-xs text-gray-400 px-4 pb-2">Vendre plus · COD Tunisie</p>
      </div>

      {websiteSlug && (
        <div className="site-navigation">
          <a href={`/store/${websiteSlug}`} target="_blank" rel="noopener noreferrer" className="site-nav-btn">
            <Eye size={18} /><span>Voir ma boutique</span><ExternalLink size={14} />
          </a>
        </div>
      )}

      <nav className="sidebar-nav">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="nav-section">
            {section.title && (
              <button className="section-title" onClick={() => section.collapsible && toggleSection(section.title!)}>
                <span>{section.title}</span>
                {section.collapsible && (expandedSections.includes(section.title) ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>
            )}
            <div className={`nav-items ${section.title && !expandedSections.includes(section.title) ? 'collapsed' : ''}`}>
              {section.items.map((item) => (
                <Link key={item.path} to={item.path} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                  <item.icon size={18} /><span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span className="ml-2">{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
        </Button>
      </div>

      <style>{`
        .sidebar { height: 100vh; background: #fff; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; width: 220px; }
        .sidebar-header { padding: 1rem; border-bottom: 1px solid #f3f4f6; }
        .logo { display: flex; align-items: center; gap: 0.5rem; }
        .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #3B82F6, #10B981); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
        .logo-text { font-weight: 800; font-size: 1.1rem; }
        .site-navigation { padding: 0.75rem 1rem; }
        .site-nav-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.75rem; background: #f0fdf4; color: #15803d; border-radius: 0.75rem; font-size: 0.85rem; font-weight: 600; text-decoration: none; }
        .sidebar-nav { flex: 1; overflow-y: auto; padding: 0.5rem; }
        .section-title { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; background: none; border: none; cursor: pointer; }
        .nav-items.collapsed { display: none; }
        .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.75rem; border-radius: 0.6rem; color: #374151; text-decoration: none; font-size: 0.9rem; font-weight: 500; margin-bottom: 2px; }
        .nav-item:hover { background: #f3f4f6; }
        .nav-item.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
        .sidebar-footer { padding: 1rem; border-top: 1px solid #f3f4f6; }
      `}</style>
    </div>
  );
};

export default ModernSidebar;
