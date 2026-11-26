import {
  EntidadNoProcesable,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';

export interface UbicacionResuelta {
  direccion?: string;
  latitud: number | null;
  longitud: number | null;
}

export interface UbicacionInput {
  direccion?: string;
  latitud?: number;
  longitud?: number;
}

export async function resolverUbicacionParaCrear(
  geo: GeocodificacionPort,
  input: UbicacionInput,
): Promise<UbicacionResuelta> {
  const ubicacion = await resolver(geo, input, true);
  if (!ubicacion) {
    throw new Error('La ubicación es obligatoria al crear un centro.');
  }
  return ubicacion;
}

export function resolverUbicacionParaActualizar(
  geo: GeocodificacionPort,
  input: UbicacionInput,
): Promise<UbicacionResuelta | undefined> {
  return resolver(geo, input, false);
}

async function resolver(
  geo: GeocodificacionPort,
  { direccion, latitud, longitud }: UbicacionInput,
  requerida: boolean,
): Promise<UbicacionResuelta | undefined> {
  if ((latitud == null) !== (longitud == null)) {
    throw new ReglaDeNegocioViolada('Debes enviar latitud y longitud juntas.');
  }

  if (latitud != null && longitud != null) {
    return {
      ...(direccion !== undefined ? { direccion } : {}),
      latitud,
      longitud,
    };
  }

  if (!direccion) {
    if (requerida) {
      throw new ReglaDeNegocioViolada(
        'Debes indicar una dirección o las coordenadas del centro.',
      );
    }
    return undefined;
  }

  const coordenadas = await geo.geocodificar(direccion);

  if (!coordenadas) {
    if (geo.modoEstricto) {
      throw new EntidadNoProcesable(
        `No se pudo obtener la ubicación para la dirección "${direccion}". Verifícala e intenta de nuevo.`,
      );
    }
    // En modo tolerante se limpian las coordenadas para no dejar una
    // ubicación antigua asociada a una dirección nueva.
    return { direccion, latitud: null, longitud: null };
  }

  return {
    direccion,
    latitud: coordenadas.latitud,
    longitud: coordenadas.longitud,
  };
}
