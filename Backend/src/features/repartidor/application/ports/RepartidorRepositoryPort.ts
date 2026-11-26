import type { Repartidor } from '../../domain/Repartidor.js';

export const REPARTIDOR_REPOSITORY = Symbol('REPARTIDOR_REPOSITORY');

export interface RepartidorConRelaciones {
  idUser: number;
  nombre: string;
  edad: number;
  flota: { id: number; nombre: string };
  centros: { id: number; nombre: string }[];
}

export interface RepartidorRepositoryPort {
  guardar(r: Repartidor): Promise<Repartidor>;
  buscarPorId(idUser: number): Promise<Repartidor | null>;
  listar(): Promise<RepartidorConRelaciones[]>;
  obtenerConRelaciones(idUser: number): Promise<RepartidorConRelaciones | null>;
  tieneDependencias(idUser: number): Promise<boolean>;
  eliminar(idUser: number): Promise<Repartidor>;
}