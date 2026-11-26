export const GEOCODIFICACION_PORT = Symbol('GEOCODIFICACION_PORT');

export interface CoordenadasGeo {
  latitud: number;
  longitud: number;
}

export interface GeocodificacionPort {
  /** Devuelve null si el proveedor no resuelve la dirección. */
  geocodificar(direccion: string): Promise<CoordenadasGeo | null>;

  /** La política estricto/tolerante la aplica la capa de aplicación. */
  readonly modoEstricto: boolean;
}
