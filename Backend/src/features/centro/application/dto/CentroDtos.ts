import type { CentroZonaResumen } from '../models/CentroConZonas.js';
import type { TipoAsignacionCentro } from '../ports/CentroRepositoryPort.js';

/** Entrada del caso de uso CrearCentro. */
export interface CrearCentroInput {
  nombre: string;
  programaLogistico: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  zonasIds?: number[];
}

/** Entrada del caso de uso ActualizarCentro. */
export interface ActualizarCentroInput {
  nombre?: string;
  programaLogistico?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  zonasIds?: number[];
}

/** Salida que devuelve la aplicación/controlador. */
export interface CentroOutput {
  id: number;
  nombre: string;
  programaLogistico: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  zonas: CentroZonaResumen[];
}

/** Entrada de los casos de uso Asignar/DesasignarCentroPorCorreo. */
export interface AsignarCentroPorCorreoInput {
  correo: string;
  tipo: TipoAsignacionCentro;
  centroId?: number;
  centroNombre?: string;
}
