import type { LoginResult, UserRole } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Maps the backend's effective role to the frontend role type.
 *
 * The backend returns `rolEfectivo`, which flattens `RolUser` with the
 * coordinator specialty (ADMINISTRADOR, SUPERVISOR, LOGISTICO, REPARTIDOR).
 */
const ROLE_MAP: Record<string, UserRole> = {
  ADMINISTRADOR: 'admin',
  SUPERVISOR: 'supervisor',
  LOGISTICO: 'coordinador',
  REPARTIDOR: 'repartidor',
};

/**
 * Raw user shape returned by the backend's POST /auth/login endpoint.
 */
interface BackendUserResponse {
  id: number;
  correo: string;
  nombre: string;
  rol: string;
  rolEfectivo: string;
}

/**
 * Raw response shape from the backend's POST /auth/login endpoint.
 */
interface BackendLoginResponse {
  user: BackendUserResponse;
  access_token: string;
}

/**
 * Authentication service.
 *
 * Calls the real backend and maps its response to the frontend shapes.
 */
export const authService = {
  /**
   * Authenticates a user with email and password.
   *
   * @param email - User's email address.
   * @param password - Plain-text password entered by the user.
   * @returns The authenticated user and its JWT access token.
   * @throws Error with message "Credenciales incorrectas" on failure.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    let response: Response;

    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor');
    }

    if (!response.ok) {
      throw new Error('Credenciales incorrectas');
    }

    const data: BackendLoginResponse = await response.json();

    return {
      user: {
        id: String(data.user.id),
        email: data.user.correo,
        name: data.user.nombre || 'Usuario',
        role: ROLE_MAP[data.user.rolEfectivo] ?? 'coordinador',
      },
      token: data.access_token,
    };
  },
};
