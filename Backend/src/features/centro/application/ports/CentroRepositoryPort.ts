import type { Centro } from '../../domain/Centro.js';

export const CENTRO_REPOSITORY = Symbol('CENTRO_REPOSITORY');

/** Relación del centro sobre la que se actúa al asignar/desasignar. */
export type TipoAsignacionCentro = 'crear' | 'validar' | 'repartidor';

/** Resumen de un usuario asignado a un centro. */
export interface AsignacionResumen {
  idUser: number;
  nombre: string;
  correo: string;
}

/** Asignaciones actuales de un centro. */
export interface AsignacionesCentro {
  coordinadoresCrear: AsignacionResumen[];
  coordinadoresValidar: AsignacionResumen[];
  repartidores: AsignacionResumen[];
}

/** Resultado de asignar/desasignar por correo. */
export interface AsignacionPorCorreoResultado extends AsignacionResumen {
  tipo: TipoAsignacionCentro;
}

export interface CentroRepositoryPort {
  /** Crea el centro, conecta sus zonas y auto-asigna al coordinador creador. */
  crear(centro: Centro, creadorId: number): Promise<Centro>;

  /** Persiste el estado actual del centro y reemplaza sus zonas. */
  actualizar(centro: Centro): Promise<Centro>;

  /** Trae el centro con sus `zonasIds` (sin nombres). Null si no existe. */
  buscarPorId(id: number): Promise<Centro | null>;

  /** Busca un centro por nombre exacto. Null si no existe. */
  buscarPorNombre(nombre: string): Promise<Centro | null>;

  /** ¿Ya existe un centro con ese nombre? `excluirId` para updates. */
  existeNombre(nombre: string, excluirId?: number): Promise<boolean>;

  /** ¿El usuario gestiona el centro (crear/validar rutas)? → 403. */
  estaAutorizado(id: number, userId: number): Promise<boolean>;

  /** ¿Tiene pedidos o repartidores? Bloquea el borrado. */
  tieneDependencias(id: number): Promise<boolean>;

  /** Elimina el centro. */
  eliminar(id: number): Promise<void>;

  /** Asigna a un usuario al centro según su correo y el tipo de relación. */
  asignarPorCorreo(
    idCentro: number,
    correo: string,
    tipo: TipoAsignacionCentro,
  ): Promise<AsignacionPorCorreoResultado>;

  /** Desasigna a un usuario del centro según su correo y el tipo de relación. */
  desasignarPorCorreo(
    idCentro: number,
    correo: string,
    tipo: TipoAsignacionCentro,
  ): Promise<AsignacionPorCorreoResultado>;

  /** Devuelve quién está asignado al centro (coordinadores y repartidores). */
  obtenerAsignaciones(id: number): Promise<AsignacionesCentro>;
}
