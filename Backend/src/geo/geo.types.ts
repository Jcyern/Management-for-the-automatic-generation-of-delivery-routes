/** Coordenadas geográficas de un punto (WGS84). */
export interface Coordenadas {
  latitud: number;
  longitud: number;
}

/** Contrato que debe cumplir cualquier proveedor de geocoding. */
export interface GeocodingProvider {
  readonly nombre: string;
  /**
   * Devuelve las coordenadas de una dirección o `null` si no se encontró.
   * Puede lanzar si el proveedor falla (red, timeout, respuesta inválida).
   */
  geocodificar(direccion: string): Promise<Coordenadas | null>;
}

/** Token de inyección del proveedor de geocoding. */
export const GEOCODING_PROVIDER = 'GEOCODING_PROVIDER';
