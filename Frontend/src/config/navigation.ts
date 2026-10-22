import type { UserRole } from '../features/auth/types/auth';

/**
 * A single item in the sidebar navigation.
 */
export interface NavItem {
  /** Visible label in the sidebar. */
  label: string;

  /** Route path the item links to. */
  path: string;

  /** Icon name from lucide-react (or the icon library used). */
  icon: string;

  /** Roles allowed to see and access this item. */
  allowedRoles: UserRole[];
}

/**
 * Navigation items shown in the sidebar.
 *
 * Filtered at runtime based on the authenticated user's role.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Inicio',
    path: '/dashboard',
    icon: 'Home',
    allowedRoles: ['coordinador', 'repartidor', 'supervisor', 'admin'],
  },
  {
    label: 'Pedidos',
    path: '/dashboard/pedidos',
    icon: 'Package',
    allowedRoles: ['coordinador', 'supervisor', 'admin'],
  },
  {
    label: 'Rutas',
    path: '/dashboard/rutas',
    icon: 'Route',
    allowedRoles: ['coordinador', 'supervisor', 'repartidor', 'admin'],
  },
  {
    label: 'Reprogramaciones',
    path: '/dashboard/reprogramaciones',
    icon: 'RefreshCw',
    allowedRoles: ['coordinador', 'repartidor'],
  },
  {
    label: 'Reportes',
    path: '/dashboard/reportes',
    icon: 'BarChart3',
    allowedRoles: ['coordinador', 'supervisor', 'repartidor', 'admin'],
  },
  {
    label: 'Centros',
    path: '/dashboard/centros',
    icon: 'Building2',
    allowedRoles: ['admin', 'supervisor'],
  },
  {
    label: 'Usuarios',
    path: '/dashboard/usuarios',
    icon: 'Users',
    allowedRoles: ['admin'],
  },
];