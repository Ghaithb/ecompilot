import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type RoleRouteProps = {
  children: React.ReactNode;
  roles: string[];
  fallback?: string;
};

/** Route protégée par rôle JWT */
const RoleRoute: React.FC<RoleRouteProps> = ({ children, roles, fallback = '/dashboard' }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles || [];
  const expanded = new Set(userRoles);
  if (expanded.has('user')) expanded.add('merchant');

  const allowed = roles.some((r) => expanded.has(r));
  if (!allowed) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
