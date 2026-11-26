import type { EspecialidadCoordinador, Coordinador } from '../../domain/Coordinador.js';

export const COORDINADOR_REPOSITORY = Symbol('COORDINADOR_REPOSITORY');

export interface ActualizarCoordinadorPersistenciaInput {
  nombre?: string;
  especialidad?: EspecialidadCoordinador;
  centrosCrearIds?: number[];
  centrosValidarIds?: number[];
}

export interface CoordinadorRepositoryPort {
  listar(): Promise<Coordinador[]>;
  buscarPorId(id: number): Promise<Coordinador | null>;
  actualizar(
    id: number,
    actual: Coordinador,
    input: ActualizarCoordinadorPersistenciaInput,
  ): Promise<Coordinador>;
  contarAsignaciones(id: number): Promise<number>;
  contarReprogramacionesPendientes(id: number): Promise<number>;
  eliminar(id: number): Promise<Coordinador>;
}
