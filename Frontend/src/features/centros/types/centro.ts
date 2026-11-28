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
