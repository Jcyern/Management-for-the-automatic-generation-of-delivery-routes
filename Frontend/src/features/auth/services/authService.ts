import type { User } from '../types/auth';

/**
 * Mock users used while the real backend is not available.
 *
 * IMPORTANT: Replace this with the real API once it is ready.
 * Passwords are stored in plain text here because this is a mock;
 * this is never acceptable in production.
 */
const MOCK_USERS = [
  {
    id: '1',
    name: 'Ana Coordinadora',
    email: 'coordinador@test.com',
    password: 'password123',
    role: 'coordinador' as const,
  },
  {
    id: '2',
    name: 'Carlos Repartidor',
    email: 'repartidor@test.com',
    password: 'password123',
    role: 'repartidor' as const,
  },
  {
    id: '3',
    name: 'Sofía Supervisora',
    email: 'supervisor@test.com',
    password: 'password123',
    role: 'supervisor' as const,
  },
  {
    id: '4',
    name: 'Admin Sistema',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin' as const,
  },
];

/**
 * Authentication service.
 *
 * Currently uses in-memory mock users. When the backend is ready,
 * only the body of the `login` method needs to change to an HTTP call.
 * The rest of the application does not need to be touched.
 */
export const authService = {
  /**
   * Authenticates a user with email and password.
   *
   * Simulates a network delay so the UI can exercise its loading state.
   *
   * @param email - User's email address.
   * @param password - Plain-text password entered by the user.
   * @returns The authenticated user, without the password field.
   * @throws Error with message "Credenciales incorrectas" if no match is found.
   */
  async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};