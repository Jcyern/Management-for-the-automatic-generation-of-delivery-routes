import type { Vehiculo } from '../../domain/Vehiculo.js';
import type { VehiculoOutput, VehiculoConRelacionesOutput } from '../dto/VehiculoDtos.js';
import type { VehiculoConRelaciones } from '../ports/VehiculoRepositoryPort.js';

export function aVehiculoOutput(v: Vehiculo): VehiculoOutput {
  if (v.id === null) throw new Error('No se puede mapear un Vehiculo sin id.');
  return { id: v.id, capacidad: v.capacidad, idFlota: v.idFlota };
}

export function aVehiculoConRelacionesOutput(v: VehiculoConRelaciones): VehiculoConRelacionesOutput {
  return { id: v.id, capacidad: v.capacidad, flota: v.flota };
}