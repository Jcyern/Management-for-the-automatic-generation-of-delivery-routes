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
import type { User } from '../types/auth';

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

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should start with no user and finish loading after mount', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('should login and set the user', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password123');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should logout and clear the user', async () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(mockUser);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});