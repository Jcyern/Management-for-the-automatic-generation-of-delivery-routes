import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { Login } from './features/auth/pages/Login/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { RoleRoute } from './components/RoleRoute';
import { Home } from './features/dashboard/pages/Home/Home';
import { PedidosList } from './features/pedidos/pages/PedidosList/PedidosList';
import { ZonasList } from './features/zonas/pages/ZonasList/ZonasList';
import { CentrosList } from './features/centros/pages/CentrosList/CentrosList';
import { RutasList } from './features/rutas/pages/RutasList/RutasList';

/**
 * Route wrapper that only allows access to authenticated users.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/**
 * Route wrapper that only allows access to unauthenticated users.
 */
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

/**
 * Application route definitions.
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
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Home />} />

        <Route
          path="/dashboard/pedidos"
          element={
            <RoleRoute allowedRoles={['logistico', 'admin']}>
              <PedidosList />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/zonas"
          element={
            <RoleRoute allowedRoles={['admin', 'supervisor', 'logistico']}>
              <ZonasList />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/rutas"
          element={
            <RoleRoute allowedRoles={['logistico', 'supervisor', 'repartidor', 'admin']}>
              <RutasList />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/centros"
          element={
            <RoleRoute allowedRoles={['admin', 'supervisor', 'logistico', 'repartidor']}>
              <CentrosList />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/usuarios"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <div>Página de Usuarios (por implementar)</div>
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * Root component of the application.
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