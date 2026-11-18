import { request } from '../../../lib/apiClient';
import type { Zona, ZonaInput } from '../types/zona';

/**
 * Service for the zones (Zona) endpoints.
 *
 * Only knows the API contract: paths, HTTP methods and payloads.
 * Token and Content-Type are handled by `apiClient`.
 */
export const zonasService = {
  /**
   * Retrieves all zones.
   *
   * @returns A promise that resolves to the list of zones.
   */
  getAll: () => request<Zona[]>('/zona'),

  /**
   * Retrieves a single zone by its id.
   *
   * @param id Zone identifier.
   * @returns A promise that resolves to the zone.
   */
  getById: (id: number) => request<Zona>(`/zona/${id}`),

  /**
   * Creates a new zone.
   *
   * @param data Zone fields to create.
   * @returns A promise that resolves to the created zone.
   */
  create: (data: ZonaInput) =>
    request<Zona>('/zona', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Updates an existing zone.
   *
   * @param id Zone identifier.
   * @param data Zone fields to update.
   * @returns A promise that resolves to the updated zone.
   */
  update: (id: number, data: ZonaInput) =>
    request<Zona>(`/zona/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Deletes a zone.
   *
   * @param id Zone identifier.
   * @returns A promise that resolves to the deleted zone.
   */
  remove: (id: number) =>
    request<Zona>(`/zona/${id}`, { method: 'DELETE' }),
};
