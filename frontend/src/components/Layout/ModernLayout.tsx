import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import ModernNavbar from './ModernNavbar';

const ModernLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="modern-layout">
      <div className={`sidebar-container ${sidebarOpen ? 'mobile-open' : ''}`}>
        <ModernSidebar />
      </div>

      {sidebarOpen && (
        <div className="mobile-overlay" onClick={toggleSidebar} aria-hidden="true" />
      )}

      <div className="main-container">
        <ModernNavbar onMenuToggle={toggleSidebar} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .modern-layout {
          display: flex;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background: var(--background, #f9fafb);
        }

        .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 240px;
          height: 100vh;
          max-height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 40;
          flex-shrink: 0;
        }

        .main-container {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          min-width: 0;
          max-width: calc(100vw - 240px);
          overflow: hidden;
        }

        .page-content {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-overlay {
          display: none;
        }

        [dir="rtl"] .sidebar-container {
          left: auto;
          right: 0;
        }

        [dir="rtl"] .main-container {
          margin-left: 0;
          margin-right: 240px;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 50;
          }

          [dir="rtl"] .sidebar-container {
            transform: translateX(100%);
          }

          .sidebar-container.mobile-open,
          [dir="rtl"] .sidebar-container.mobile-open {
            transform: translateX(0);
          }

          .main-container,
          [dir="rtl"] .main-container {
            margin-left: 0;
            margin-right: 0;
            max-width: 100vw;
          }

          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernLayout;
