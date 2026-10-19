/**
 * Unit tests for the `authService` mock.
 *
 * Verifies that valid credentials return the user without the password,
 * and that invalid credentials throw an error.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

describe('authService.login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the mapped user when credentials are valid', async () => {
    const mockBackendResponse = {
      id: 7,
      correo: 'coordinador@test.com',
      nombre: 'Ana Coordinadora',
      rol: 'LOGISTICO',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    }));

    const user = await authService.login('coordinador@test.com', 'password123');

    expect(user).toEqual({
      id: '7',
      email: 'coordinador@test.com',
      name: 'Ana Coordinadora',
      role: 'coordinador',
    });
  });

  it('should throw an error when credentials are invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    }));

    await expect(
      authService.login('wrong@test.com', 'wrongpass')
    ).rejects.toThrow('Credenciales incorrectas');
  });
});