import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroOutput } from '../dto/CentroDtos.js';

export function aCentroOutput({ centro, zonas }: CentroConZonas): CentroOutput {
  if (centro.id === null) {
    throw new Error('No se puede mapear un Centro sin id persistido.');
  }
  return {
    id: centro.id,
    nombre: centro.nombre,
    programaLogistico: centro.programaLogistico,
    direccion: centro.direccion,
    latitud: centro.latitud,
    longitud: centro.longitud,
    zonas,
  };
}
