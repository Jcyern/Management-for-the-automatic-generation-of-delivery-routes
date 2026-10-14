/**
 * Roles available in the delivery route management system.
 */
export type UserRole = 'coordinador' | 'repartidor' | 'supervisor' | 'admin';

/**
 * Represents an authenticated user in the system.
 */
export interface User {
  /** Unique identifier of the user. */
  id: string;

  /** Full name of the user. */
  name: string;

  /** Email address, used as the login credential. */
  email: string;

  /** Role that determines the user's permissions in the system. */
  role: UserRole;
}

/**
 * Contract of the authentication context exposed to the entire application.
 */
export interface AuthContextType {
  /** Currently authenticated user, or `null` if there is no active session. */
  user: User | null;

  /** Whether there is an authenticated user right now. */
  isAuthenticated: boolean;

  /** Whether the session is being restored from `localStorage` on startup. */
  isLoading: boolean;

  /**
   * Authenticates a user with email and password.
   *
   * @param email - User's email address.
   * @param password - User's plain-text password.
   * @returns A promise that resolves when the login completes.
   * @throws Error if the credentials are invalid.
   */
  login: (email: string, password: string) => Promise<void>;

  /** Logs out the current user and clears the local storage. */
  logout: () => void;
}