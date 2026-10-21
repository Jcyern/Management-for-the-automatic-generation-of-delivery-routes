import type { Parada, CreateParadaDto } from '../types/parada';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Error body returned by NestJS. */
interface BackendError {
  message?: string | string[];
}

export const paradasService = {
  /**
   * Creates a new stop in the backend.
   *
   * @param data - The stop data matching the backend DTO.
   * @returns The created stop.
   * @throws Error with the backend message when the request fails.
   */
  async create(data: CreateParadaDto): Promise<Parada> {
    const response = await fetch(`${API_URL}/paradas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as BackendError | null;
      const message = Array.isArray(body?.message)
        ? body.message.join(', ')
        : body?.message;
      throw new Error(message ?? 'Error al crear la parada');
    }

    return response.json();
  },
};
