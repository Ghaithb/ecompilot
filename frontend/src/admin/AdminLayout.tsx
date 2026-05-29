import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-bold">Admin</div>
          <div className="flex gap-4 text-sm">
            <Link className={isActive('/admin/users') ? 'text-black' : 'text-gray-600'} to="/admin/users">Utilisateurs</Link>
            <Link className={isActive('/admin/settings') ? 'text-black' : 'text-gray-600'} to="/admin/settings">Paramètres</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
