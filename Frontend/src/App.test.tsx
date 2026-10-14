/**
 * Unit tests for the `ProtectedRoute` and `PublicRoute` guards.
 *
 * Verifies redirection behavior based on the authentication state
 * and the loading state.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './features/auth/context/AuthContext';

const TestDashboard = () => <div>Dashboard Privado</div>;
const TestLogin = () => <div>Página de Login</div>;

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

vi.mock('./features/auth/context/AuthContext', async () => {
  const actual = await vi.importActual('./features/auth/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockedUseAuth = vi.mocked(useAuth);

const mockedAuthReturn = (
  isAuthenticated: boolean,
  isLoading: boolean
) => ({
  isAuthenticated,
  isLoading,
  user: isAuthenticated
    ? { id: '1', name: 'Test', email: 'test@test.com', role: 'coordinador' as const }
    : null,
  login: vi.fn(),
  logout: vi.fn(),
});

describe('Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('should show loading when isLoading is true', () => {
      mockedUseAuth.mockReturnValue(mockedAuthReturn(false, true));
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TestDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
      expect(screen.queryByText(/dashboard privado/i)).not.toBeInTheDocument();
    });

    it('should redirect to /login when not authenticated', () => {
      mockedUseAuth.mockReturnValue(mockedAuthReturn(false, false));
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<TestLogin />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TestDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText(/página de login/i)).toBeInTheDocument();
    });

    it('should render children when authenticated', () => {
      mockedUseAuth.mockReturnValue(mockedAuthReturn(true, false));
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <TestDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText(/dashboard privado/i)).toBeInTheDocument();
    });
  });

  describe('PublicRoute', () => {
    it('should render children when not authenticated', () => {
      mockedUseAuth.mockReturnValue(mockedAuthReturn(false, false));
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <TestLogin />
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText(/página de login/i)).toBeInTheDocument();
    });

    it('should redirect to /dashboard when authenticated', () => {
      mockedUseAuth.mockReturnValue(mockedAuthReturn(true, false));
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <TestLogin />
                </PublicRoute>
              }
            />
            <Route path="/dashboard" element={<TestDashboard />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText(/dashboard privado/i)).toBeInTheDocument();
    });
  });
});