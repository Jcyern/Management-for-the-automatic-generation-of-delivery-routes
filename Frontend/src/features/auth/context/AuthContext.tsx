import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';

/**
 * React context that holds the authentication state.
 *
 * Do not use directly. Use the `useAuth` hook instead.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication context provider.
 *
 * Wraps the whole application and exposes the current user, the session
 * state, and the login/logout functions to any child component through
 * the `useAuth` hook.
 *
 * Persists the session in `localStorage` so it survives page reloads.
 *
 * @param props.children - Child components that will have access to the context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  /**
   * Authenticates the user and stores the session in state and localStorage.
   *
   * @param email - User's email address.
   * @param password - User's plain-text password.
   * @throws Error if the credentials are invalid.
   */
  const login = async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    localStorage.setItem('user', JSON.stringify(loggedUser));
  };

  /** Logs out the current user and clears the local storage. */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook that exposes the authentication context.
 *
 * Must be called inside a component wrapped by `<AuthProvider>`.
 *
 * @throws Error if used outside the `AuthProvider`.
 * @returns The context with the user, the session state, and the auth functions.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}