import type { Flota } from '../../domain/Flota.js';
import type { FlotaOutput, FlotaConRelacionesOutput } from '../dto/FlotaDtos.js';
import type { FlotaConRelaciones } from '../ports/FlotaRepositoryPort.js';

export function aFlotaOutput(flota: Flota): FlotaOutput {
  if (flota.id === null) {
    throw new Error('No se puede mapear una Flota sin id persistido.');
  }
  return { id: flota.id, nombre: flota.nombre };
}

export function aFlotaConRelacionesOutput(flota: FlotaConRelaciones): FlotaConRelacionesOutput {
  return {
    id: flota.id,
    nombre: flota.nombre,
    vehiculos: flota.vehiculos,
    repartidores: flota.repartidores,
  };
}