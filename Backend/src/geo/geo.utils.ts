import type { Coordenadas } from './geo.types.js';

const RADIO_TIERRA_KM = 6371;
const VELOCIDAD_PROMEDIO_KMH = 25;

/**
 * Normaliza una dirección para usarla como clave de caché:
 * minúsculas, sin tildes, sin puntuación redundante y con espacios colapsados.
 */
export function normalizarDireccion(direccion: string): string {
  return direccion
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Comprueba que las coordenadas son números dentro de los rangos válidos. */
export function sonCoordenadasValidas(
  coordenadas: Coordenadas | null | undefined,
): coordenadas is Coordenadas {
  if (!coordenadas) {
    return false;
  }

  const { latitud, longitud } = coordenadas;
  return (
    Number.isFinite(latitud) &&
    Number.isFinite(longitud) &&
    latitud >= -90 &&
    latitud <= 90 &&
    longitud >= -180 &&
    longitud <= 180
  );
}

/** Distancia Haversine en kilómetros entre dos puntos (WGS84). */
export function haversineKm(a: Coordenadas, b: Coordenadas): number {
  const toRad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = toRad(b.latitud - a.latitud);
  const dLon = toRad(b.longitud - a.longitud);
  const lat1 = toRad(a.latitud);
  const lat2 = toRad(b.latitud);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

/** Tiempo estimado en minutos para recorrer una distancia a velocidad promedio urbana. */
export function tiempoEstimadoMin(distanciaKm: number): number {
  if (distanciaKm <= 0) return 0;
  return Math.max(1, Math.round((distanciaKm / VELOCIDAD_PROMEDIO_KMH) * 60));
}
