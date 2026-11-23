import type { Zona } from '../../domain/Zona.js';
import type { ZonaOutput } from '../dto/ZonaDtos.js';

export function aZonaOutput(zona: Zona): ZonaOutput {
  if (zona.id === null) {
    throw new Error('No se puede mapear una Zona sin id persistido.');
  }
  return { id: zona.id, nombre: zona.nombre };
}
