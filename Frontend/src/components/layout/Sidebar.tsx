import { NavLink } from 'react-router-dom';
import {
  Home,
  Package,
  Route,
  RefreshCw,
  BarChart3,
  Building2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { NAV_ITEMS } from '../../config/navigation';
import './Sidebar.css';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Package,
  Route,
  RefreshCw,
  BarChart3,
  Building2,
  Users,
};

/**
 * Sidebar of the dashboard.
 *
 * Shows only the navigation items allowed for the authenticated user's role.
 */
export function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">Rutas</span>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              {Icon && <Icon className="sidebar-icon" size={18} />}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}