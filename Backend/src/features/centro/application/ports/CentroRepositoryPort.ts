import type { Centro } from '../../domain/Centro.js';

export const CENTRO_REPOSITORY = Symbol('CENTRO_REPOSITORY');

export interface CentroRepositoryPort {
  /** Crea el centro, conecta sus zonas y auto-asigna al coordinador creador. */
  crear(centro: Centro, creadorId: number): Promise<Centro>;

  /** Persiste el estado actual del centro y reemplaza sus zonas. */
  actualizar(centro: Centro): Promise<Centro>;

  /** Trae el centro con sus `zonasIds` (sin nombres). Null si no existe. */
  buscarPorId(id: number): Promise<Centro | null>;

  /** ¿Ya existe un centro con ese nombre? `excluirId` para updates. */
  existeNombre(nombre: string, excluirId?: number): Promise<boolean>;

  /** ¿El usuario gestiona el centro (crear/validar rutas)? → 403. */
  estaAutorizado(id: number, userId: number): Promise<boolean>;

  /** ¿Tiene pedidos o repartidores? Bloquea el borrado. */
  tieneDependencias(id: number): Promise<boolean>;

  /** Elimina el centro. */
  eliminar(id: number): Promise<void>;
}
