import type { Centro } from '../../domain/Centro.js';

/** Nombres de zonas resueltos en lectura (no viven en el dominio). */
export interface CentroZonaResumen {
  id: number;
  nombre: string;
}

/** Modelo de lectura: entidad + nombres de sus zonas. */
export interface CentroConZonas {
  centro: Centro;
  zonas: CentroZonaResumen[];
}
