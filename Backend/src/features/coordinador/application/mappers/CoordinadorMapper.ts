import type { Coordinador } from '../../domain/Coordinador.js';
import type {
  CoordinadorOutput,
  SubtipoOutput,
} from '../dto/CoordinadorDtos.js';

function subtipo(
  tiene: boolean,
  id: number,
  nombre: string,
): SubtipoOutput | null {
  return tiene ? { id, nombre } : null;
}

export function aCoordinadorOutput(coordinador: Coordinador): CoordinadorOutput {
  return {
    idUser: coordinador.id,
    nombre: coordinador.nombre,
    especialidad: coordinador.especialidad,
    user: {
      id: coordinador.id,
      correo: coordinador.correo,
      rol: coordinador.rolUsuario,
    },
    centrosCrearRuta: coordinador.centrosCrearRuta.map((c) => ({
      id: c.id,
      nombre: c.nombre,
    })),
    centrosValidarRuta: coordinador.centrosValidarRuta.map((c) => ({
      id: c.id,
      nombre: c.nombre,
    })),
    logistico: subtipo(
      coordinador.tieneLogistico,
      coordinador.id,
      coordinador.nombre,
    ),
    supervisor: subtipo(
      coordinador.tieneSupervisor,
      coordinador.id,
      coordinador.nombre,
    ),
    administrador: subtipo(
      coordinador.tieneAdministrador,
      coordinador.id,
      coordinador.nombre,
    ),
  };
}
