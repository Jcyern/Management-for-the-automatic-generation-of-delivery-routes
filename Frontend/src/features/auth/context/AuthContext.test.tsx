/**
 * Unit tests for the `useAuth` hook and the `AuthProvider` context.
 *
 * Covers session restoration from localStorage, the login flow, and logout.
 * The authService is mocked to isolate the context logic from the actual
 * authentication implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';
import type { LoginResult, User } from '../types/auth';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@test.com',
  role: 'coordinador',
};

const mockLoginResult: LoginResult = {
  user: mockUser,
  token: 'jwt-token',
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should start with no user and finish loading after mount', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('should login and store the user and token', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResult);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password123');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('jwt-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('should restore the session from localStorage', async () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'stored-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('stored-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should discard a stored session without a token', async () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should logout and clear the user and token', async () => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'stored-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(mockUser);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
