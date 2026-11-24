import type { Flota } from '../../domain/Flota.js';

export const FLOTA_REPOSITORY = Symbol('FLOTA_REPOSITORY');

// Interfaz para las respuestas que incluyen relaciones
export interface FlotaConRelaciones {
  id: number;
  nombre: string;
  vehiculos: unknown[];
  repartidores: unknown[];
}

export interface FlotaRepositoryPort {
  guardar(flota: Flota): Promise<Flota>;
  buscarPorId(id: number): Promise<Flota | null>;
  buscarPorNombre(nombre: string): Promise<Flota | null>;
  listar(): Promise<FlotaConRelaciones[]>;
  obtenerConRelaciones(id: number): Promise<FlotaConRelaciones | null>;
  tieneDependencias(id: number): Promise<boolean>;
  eliminar(id: number): Promise<Flota>;
}