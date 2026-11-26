import type { CentroZonaResumen } from '../models/CentroConZonas.js';

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
