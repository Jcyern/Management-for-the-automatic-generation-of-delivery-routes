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
 * Wraps the whole application and exposes the current user, the JWT token,
 * the session state, and the login/logout functions to any child component
 * through the `useAuth` hook.
 *
 * Persists the session in `localStorage` so it survives page reloads.
 *
 * @param props.children - Child components that will have access to the context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // A session without a token cannot authenticate API requests.
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
    const { user: loggedUser, token: accessToken } = await authService.login(
      email,
      password,
    );

    setUser(loggedUser);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.setItem('token', accessToken);
  };

  /** Logs out the current user and clears the local storage. */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
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
