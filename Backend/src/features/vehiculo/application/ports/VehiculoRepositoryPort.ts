import type { Vehiculo } from '../../domain/Vehiculo.js';

export const VEHICULO_REPOSITORY = Symbol('VEHICULO_REPOSITORY');

export interface VehiculoConRelaciones {
  id: number;
  capacidad: number;
  idFlota: number;
  flota: { id: number; nombre: string };
}

export interface VehiculoRepositoryPort {
  guardar(vehiculo: Vehiculo): Promise<Vehiculo>;
  buscarPorId(id: number): Promise<Vehiculo | null>;
  listar(): Promise<VehiculoConRelaciones[]>;
  obtenerConRelaciones(id: number): Promise<VehiculoConRelaciones | null>;
  tieneRutasRealizadas(id: number): Promise<boolean>;
  eliminar(id: number): Promise<Vehiculo>;
}