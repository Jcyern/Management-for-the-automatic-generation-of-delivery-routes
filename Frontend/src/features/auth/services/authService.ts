import type { User, UserRole } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Maps the backend role values to the frontend role type.
 */
const ROLE_MAP: Record<string, UserRole> = {
  LOGISTICO: 'coordinador',
  REPARTIDOR: 'repartidor',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
};

/**
 * Raw response shape from the backend's POST /SignIn endpoint.
 */
interface BackendUserResponse {
  id: number;
  correo: string;
  nombre: string;
  rol: string;
}

/**
 * Authentication service.
 *
 * Calls the real backend. Maps the response to the frontend's User shape.
 */
export const authService = {
  /**
   * Authenticates a user with email and password.
   *
   * @param email - User's email address.
   * @param password - Plain-text password entered by the user.
   * @returns The authenticated user, mapped to the frontend shape.
   * @throws Error with message "Credenciales incorrectas" on failure.
   */
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/SignIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales incorrectas');
    }

    const data: BackendUserResponse = await response.json();

    return {
      id: String(data.id),
      email: data.correo,
      name: data.nombre || 'Usuario',
      role: ROLE_MAP[data.rol] ?? 'coordinador', 
    };
  },
};