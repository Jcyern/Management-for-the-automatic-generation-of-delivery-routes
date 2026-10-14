import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { Login } from './features/auth/pages/Login/Login';

/**
 * Temporary dashboard shown after a successful login.
 *
 * Placeholder until the real dashboard is implemented.
 */
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user?.name}</p>
      <p>Rol: {user?.role}</p>
      <button onClick={logout} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        Cerrar sesión
      </button>
    </div>
  );
}

/**
 * Route wrapper that only allows access to authenticated users.
 *
 * While the session is loading, renders a temporary loading message.
 * If the user is not authenticated, redirects to `/login`.
 *
 * @param props.children - The component to render when the user is authenticated.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/**
 * Route wrapper that only allows access to unauthenticated users.
 *
 * If the user is already authenticated, redirects to `/dashboard`.
 * Useful for pages like login or register.
 *
 * @param props.children - The component to render when the user is NOT authenticated.
 */
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

/**
 * Application route definitions.
 *
 * Declares all public and protected routes and applies the corresponding
 * route wrappers.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * Root component of the application.
 *
 * Sets up the router and the authentication provider so that any
 * component in the tree can access the session state.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;