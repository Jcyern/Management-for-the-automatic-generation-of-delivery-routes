/**
 * Unit tests for the `authService`.
 *
 * Verifies that valid credentials return the mapped user plus the JWT token,
 * that the effective backend role is mapped to the frontend role, and that
 * invalid credentials throw an error.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

function mockLoginResponse(rolEfectivo: string) {
  return {
    user: {
      id: 7,
      correo: 'coordinador@test.com',
      nombre: 'Ana Coordinadora',
      rol: 'COORDINADOR',
      rolEfectivo,
    },
    access_token: 'jwt-token',
  };
}

describe('authService.login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call the backend login endpoint with the credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLoginResponse('LOGISTICO'),
    });
    vi.stubGlobal('fetch', fetchMock);

    await authService.login('coordinador@test.com', 'password123');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'coordinador@test.com',
          password: 'password123',
        }),
      }),
    );
  });

  it('should return the mapped user and token when credentials are valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLoginResponse('LOGISTICO'),
    }));

    const result = await authService.login('coordinador@test.com', 'password123');

    expect(result).toEqual({
      user: {
        id: '7',
        email: 'coordinador@test.com',
        name: 'Ana Coordinadora',
        role: 'logistico',
      },
      token: 'jwt-token',
    });
  });

  it.each([
    ['ADMINISTRADOR', 'admin'],
    ['SUPERVISOR', 'supervisor'],
    ['LOGISTICO', 'logistico'],
    ['REPARTIDOR', 'repartidor'],
  ])('should map rolEfectivo %s to %s', async (rolEfectivo, expectedRole) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLoginResponse(rolEfectivo),
    }));

    const { user } = await authService.login('user@test.com', 'password123');

    expect(user.role).toBe(expectedRole);
  });

  it('should throw a connection error when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(
      authService.login('user@test.com', 'password123')
    ).rejects.toThrow('No se pudo conectar con el servidor');
  });

  it('should throw an error when credentials are invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }));

    await expect(
      authService.login('wrong@test.com', 'wrongpass')
    ).rejects.toThrow('Credenciales incorrectas');
  });
});
