import type { CentroConZonas } from '../models/CentroConZonas.js';

export const CENTRO_QUERY = Symbol('CENTRO_QUERY');

/** Puerto de consulta: devuelve modelos de lectura con nombres de zonas. */
export interface CentroQueryPort {
  buscarPorIdConZonas(id: number): Promise<CentroConZonas | null>;
  listarPorCoordinador(userId: number): Promise<CentroConZonas[]>;
  listarTodos(): Promise<CentroConZonas[]>;
}
