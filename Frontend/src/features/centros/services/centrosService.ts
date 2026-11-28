import { request } from '../../../lib/apiClient';
import type {
  AsignacionPorCorreoResultado,
  AsignarPorCorreoInput,
  Centro,
  CentroAsignaciones,
  CentroInput,
} from '../types/centro';

/**
 * Service for the distribution center (Centro) endpoints.
 *
 * Only knows paths, HTTP methods and payloads. The base URL, JWT and
 * error handling are resolved by `apiClient`.
 */
export const centrosService = {
  /** Lists the centers visible to the authenticated user. */
  getAll: () => request<Centro[]>('/centro'),

  /** Retrieves a single center by its id. */
  getById: (id: number) => request<Centro>(`/centro/${id}`),

  /** Creates a new center. */
  create: (data: CentroInput) =>
    request<Centro>('/centro', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Updates an existing center. */
  update: (id: number, data: CentroInput) =>
    request<Centro>(`/centro/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Deletes a center and returns the deleted center preview. */
  remove: (id: number) =>
    request<Centro>(`/centro/${id}`, { method: 'DELETE' }),

  /** Assigns a user to a center by email. */
  asignarPorCorreo: (data: AsignarPorCorreoInput) =>
    request<AsignacionPorCorreoResultado>('/centro/asignar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Unassigns a user from a center by email. */
  desasignarPorCorreo: (data: AsignarPorCorreoInput) =>
    request<AsignacionPorCorreoResultado>('/centro/asignar', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),

  /** Retrieves who is assigned to a center. */
  getAsignaciones: (id: number) =>
    request<CentroAsignaciones>(`/centro/${id}/asignaciones`),
};
