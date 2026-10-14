/**
 * Unit tests for the `authService` mock.
 *
 * Verifies that valid credentials return the user without the password,
 * and that invalid credentials throw an error.
 */

import { describe, it, expect } from 'vitest';
import { authService } from './authService';

describe('authService.login', () => {
  it('should return the user when credentials are valid', async () => {
    const user = await authService.login('coordinador@test.com', 'password123');
    expect(user).toBeDefined();
    expect(user.email).toBe('coordinador@test.com');
    expect(user.role).toBe('coordinador');
    expect(user).not.toHaveProperty('password');
  });

  it('should throw an error when credentials are invalid', async () => {
    await expect(
      authService.login('wrong@email.com', 'wrongpassword')
    ).rejects.toThrow('Credenciales incorrectas');
  });
});