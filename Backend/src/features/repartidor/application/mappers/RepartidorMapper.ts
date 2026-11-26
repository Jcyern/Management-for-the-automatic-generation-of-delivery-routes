import type { Repartidor } from '../../domain/Repartidor.js';
import type { RepartidorOutput, RepartidorConRelacionesOutput } from '../dto/RepartidorDtos.js';
import type { RepartidorConRelaciones } from '../ports/RepartidorRepositoryPort.js';

export function aRepartidorOutput(r: Repartidor): RepartidorOutput {
  return { idUser: r.idUser, nombre: r.nombre, edad: r.edad, idFlota: r.idFlota };
}

export function aRepartidorConRelacionesOutput(r: RepartidorConRelaciones): RepartidorConRelacionesOutput {
  return { idUser: r.idUser, nombre: r.nombre, edad: r.edad, flota: r.flota, centros: r.centros };
}