import type { Coordenadas } from './geo.types.js';

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
