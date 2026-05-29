import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface ModernNavbarProps {
  onMenuToggle?: () => void;
}

const ModernNavbar = ({ onMenuToggle }: ModernNavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAllRead } = useRealtimeNotifications(isAuthenticated);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [websiteSlug, setWebsiteSlug] = useState<string | null>(null);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Récupérer le slug du site web
  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await api.get('/website');
        if (response.data && response.data.slug) {
          setWebsiteSlug(response.data.slug);
        }
      } catch (error: any) {
        // Ignorer l'erreur 404 (site web pas encore créé)
        if (error.response?.status !== 404) {
          console.error('Erreur lors de la récupération du site:', error);
        }
      }
    };
    fetchWebsite();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recherche:', searchQuery);
    // Implement global search
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="modern-navbar">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-btn" onClick={onMenuToggle}>
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <form className="search-form" onSubmit={handleSearch}>
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher produits, commandes, clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <kbd className="search-shortcut">Ctrl K</kbd>
      </form>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Voir mon site button */}
        {websiteSlug && (
          <a
            href={`/store/${websiteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-site-btn"
            title="Voir mon site"
          >
            <Eye size={18} />
            <span>Voir mon site</span>
            <ExternalLink size={14} className="external-icon" />
          </a>
        )}

        {/* Help Button */}
        <button className="icon-btn" title="Aide">
          <HelpCircle size={20} />
        </button>

        {/* Notifications */}
        <div className="notifications-wrapper" ref={notificationsRef}>
          <button
            className="icon-btn notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="text-btn" onClick={markAllRead}>Tout marquer comme lu</button>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notification-item">
                    <div className="notification-content">
                      <div className="notification-message">Aucune notification pour le moment</div>
                    </div>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                      <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                      </div>
                      <div className="notification-time">{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="dropdown-footer">
                <Link to="/notifications" className="text-btn">Voir toutes les notifications</Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="profile-wrapper" ref={profileMenuRef}>
          <button
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user?.tenant?.name || 'Utilisateur'}</div>
              <div className="profile-email">{user?.email}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="profile-menu-header">
                <div className="profile-avatar-large">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="profile-name-large">{user?.tenant?.name || 'Utilisateur'}</div>
                  <div className="profile-email-small">{user?.email}</div>
                </div>
              </div>

              <div className="menu-divider"></div>

              <Link to="/profile" className="menu-item">
                <User size={18} />
                <span>Mon Profil</span>
              </Link>

              <Link to="/settings" className="menu-item">
                <Settings size={18} />
                <span>Paramètres</span>
              </Link>

              <div className="menu-divider"></div>

              <button onClick={handleLogout} className="menu-item logout">
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modern-navbar {
          height: 60px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: fixed;
          top: 0;
          left: 220px;
          right: 0;
          z-index: 30;
          justify-content: space-between;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #374151;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .mobile-menu-btn:hover {
          background: #f3f4f6;
        }

        .search-form {
          flex: 1;
          max-width: 600px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 2.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #111827;
          background: #f9fafb;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          padding: 0.25rem 0.5rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #6b7280;
          font-family: monospace;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }

        .icon-btn:hover {
          background: #f3f4f6;
        }

        .view-site-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .view-site-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        }

        .external-icon {
          opacity: 0.8;
        }

        .notifications-wrapper,
        .profile-wrapper {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .profile-btn:hover {
          background: #f3f4f6;
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .profile-info {
          text-align: left;
        }

        .profile-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }

        .profile-email {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 280px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 50;
        }

        .dropdown-header {
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
        }

        .dropdown-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .text-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }

        .text-btn:hover {
          text-decoration: underline;
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item.unread {
          background: #eff6ff;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .notification-message {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #9ca3af;
          white-space: nowrap;
        }

        .dropdown-footer {
          padding: 0.75rem 1rem;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }

        .profile-menu-header {
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .profile-avatar-large {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .profile-name-large {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }

        .profile-email-small {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .menu-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0.5rem 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #374151;
          text-decoration: none;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
        }

        .menu-item:hover {
          background: #f9fafb;
        }

        .menu-item.logout {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .modern-navbar {
            left: 0;
          }

          .mobile-menu-btn {
            display: block;
          }

          .search-form {
            max-width: none;
          }

          .profile-info {
            display: none;
          }

          .search-shortcut {
            display: none;
          }

          .view-site-btn span {
            display: none;
          }

          .view-site-btn {
            padding: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default ModernNavbar;
