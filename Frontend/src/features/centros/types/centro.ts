/** Summary of a zone associated with a distribution center. */
export interface CentroZona {
  id: number;
  nombre: string;
}

/** Distribution center as returned by the API. */
export interface Centro {
  id: number;
  nombre: string;
  programaLogistico: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  zonas: CentroZona[];
}

/** Payload accepted by the create and update endpoints. */
export interface CentroInput {
  nombre: string;
  programaLogistico: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  zonasIds?: number[];
}

/** Relación del centro sobre la que se actúa al asignar/desasignar. */
export type TipoAsignacionCentro = 'crear' | 'validar' | 'repartidor';

/** Acción a ejecutar sobre una asignación. */
export type ProcesoAsignacion = 'asignar' | 'desasignar';

/** Payload para asignar/desasignar por correo. */
export interface AsignarPorCorreoInput {
  correo: string;
  tipo: TipoAsignacionCentro;
  centroId?: number;
  centroNombre?: string;
}

/** Resultado de asignar/desasignar por correo. */
export interface AsignacionPorCorreoResultado {
  idUser: number;
  nombre: string;
  correo: string;
  tipo: TipoAsignacionCentro;
}

/** Summary of a user assigned to a center. */
export interface CentroResumen {
  idUser: number;
  nombre: string;
  correo: string;
}

/** Response of GET /centro/:id/asignaciones. */
export interface CentroAsignaciones {
  coordinadoresCrear: CentroResumen[];
  coordinadoresValidar: CentroResumen[];
  repartidores: CentroResumen[];
}
