import { useAuth } from '../features/auth/context/AuthContext';

/**
 * Permission flags derived from the current user's role.
 */
export interface Permissions {
  /** Coordinador: create and edit orders. */
  canCreatePedido: boolean;

  /** Coordinador: generate routes automatically. */
  canGenerateRuta: boolean;

  /** Supervisor: validate or reject routes. */
  canValidateRuta: boolean;

  /** Coordinador: assign routes to delivery drivers. */
  canAssignRuta: boolean;

  /** Repartidor: request a reschedule for a delivery. */
  canRequestReprogramacion: boolean;

  /** Coordinador: resolve a requested reschedule. */
  canResolveReprogramacion: boolean;

  /** Admin: manage users and distribution centers. */
  canManageUsers: boolean;
  canManageCentros: boolean;

  /** Admin: resolve duplicate orders and double assignments. */
  canResolveConflicts: boolean;
}

/**
 * Returns the permissions available to the current user based on their role.
 *
 * Must be used inside a component wrapped by `<AuthProvider>`.
 *
 * @returns An object with boolean flags for each action in the system.
 */
export function usePermissions(): Permissions {
  const { user } = useAuth();
  const role = user?.role;

  return {
    canCreatePedido: role === 'coordinador',
    canGenerateRuta: role === 'coordinador',
    canValidateRuta: role === 'supervisor',
    canAssignRuta: role === 'coordinador',
    canRequestReprogramacion: role === 'repartidor',
    canResolveReprogramacion: role === 'coordinador',
    canManageUsers: role === 'admin',
    canManageCentros: role === 'admin',
    canResolveConflicts: role === 'admin',
  };
}