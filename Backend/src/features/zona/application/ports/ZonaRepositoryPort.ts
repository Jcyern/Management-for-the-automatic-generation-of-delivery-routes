import type { Zona } from '../../domain/Zona.js';

export const ZONA_REPOSITORY = Symbol('ZONA_REPOSITORY');

export interface ZonaRepositoryPort {
  guardar(zona: Zona): Promise<Zona>;
  buscarPorId(id: number): Promise<Zona | null>;
  listar(): Promise<Zona[]>;
  tieneDependencias(id: number): Promise<boolean>;
  eliminar(id: number): Promise<Zona>;
}
