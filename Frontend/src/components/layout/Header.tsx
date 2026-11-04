import { LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import './Header.css';

const ROLE_LABELS: Record<string, string> = {
  coordinador: 'Coordinador logístico',
  repartidor: 'Repartidor',
  supervisor: 'Supervisor de operaciones',
  admin: 'Administrador',
};

/**
 * Top header of the dashboard.
 *
 * Shows the current user's name and role, and a logout button.
 */
export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-user">
        <div className="header-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="header-info">
          <span className="header-name">{user.name}</span>
          <span className="header-role">{ROLE_LABELS[user.role] ?? user.role}</span>
        </div>
      </div>

      <button className="header-logout" onClick={logout} type="button">
        <LogOut size={16} />
        <span>Cerrar sesión</span>
      </button>
    </header>
  );
}