import type { Parada, CreateParadaDto } from '../types/parada';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const paradasService = {
  /**
   * Creates a new stop in the backend.
   * 
   * @param data - The stop data matching the backend DTO.
   * @returns The created stop.
   */
  async create(data: CreateParadaDto): Promise<Parada> {
    const response = await fetch(`${API_URL}/paradas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear la parada');
    }

    return response.json();
  },
};