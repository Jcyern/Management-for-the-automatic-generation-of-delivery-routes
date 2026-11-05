import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import type { UserRole } from '../features/auth/types/auth';

interface RoleRouteProps {
  /** Roles allowed to access the wrapped route. */
  allowedRoles: UserRole[];

  /** The component to render if the user is authorized. */
  children: ReactNode;
}

/**
 * Route wrapper that only allows access to users with one of the specified roles.
 *
 * Redirects to /login if the user is not authenticated, and to /dashboard
 * (the generic home) if the user does not have an allowed role.
 *
 * @param props.allowedRoles - List of roles permitted to view the route.
 * @param props.children - Component to render when access is granted.
 */
export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}