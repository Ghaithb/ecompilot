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
      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? 'mobile-open' : ''}`}>
        <ModernSidebar />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <div className="main-container">
        {/* Navbar */}
        <ModernNavbar onMenuToggle={toggleSidebar} />

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .modern-layout {
          display: flex;
          min-height: 100vh;
          background: #f9fafb;
        }

        .sidebar-container {
          width: 220px;
          flex-shrink: 0;
        }

        .main-container {
          flex: 1;
          margin-left: 0;
          display: flex;
          flex-direction: column;
          max-width: calc(100vw - 220px);
        }

        .page-content {
          flex: 1;
          padding: 0;
          margin-top: 60px; /* Navbar height */
          min-height: calc(100vh - 60px);
          width: 100%;
        }

        .mobile-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
            transition: transform 0.3s;
            z-index: 50;
          }

          .sidebar-container.mobile-open {
            transform: translateX(0);
          }

          .main-container {
            margin-left: 0;
          }

          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }

          .page-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernLayout;
