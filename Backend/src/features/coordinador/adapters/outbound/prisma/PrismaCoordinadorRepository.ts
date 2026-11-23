import { Injectable } from '@nestjs/common';
import { RolCoordinador } from '../../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';
import {
  Coordinador,
  type EspecialidadCoordinador,
} from '../../../domain/Coordinador.js';
import type {
  ActualizarCoordinadorPersistenciaInput,
  CoordinadorRepositoryPort,
} from '../../../application/ports/CoordinadorRepositoryPort.js';

const COORDINADOR_INCLUDE = {
  user: { select: { id: true, correo: true, rol: true } },
  centrosCrearRuta: { select: { id: true, nombre: true } },
  centrosValidarRuta: { select: { id: true, nombre: true } },
  logistico: true,
  supervisor: true,
  administrador: true,
} as const;

type CoordinadorRow = {
  idUser: number;
  nombre: string;
  especialidad: RolCoordinador;
  user: { id: number; correo: string; rol: string };
  centrosCrearRuta: Array<{ id: number; nombre: string }>;
  centrosValidarRuta: Array<{ id: number; nombre: string }>;
  logistico: { id: number; nombre: string } | null;
  supervisor: { id: number; nombre: string } | null;
  administrador: { id: number; nombre: string } | null;
};

function aDominio(row: CoordinadorRow): Coordinador {
  return Coordinador.rehidratar({
    id: row.idUser,
    nombre: row.nombre,
    correo: row.user.correo,
    rolUsuario: row.user.rol,
    especialidad: row.especialidad as EspecialidadCoordinador,
    centrosCrearRuta: row.centrosCrearRuta.map((c) => ({
      id: c.id,
      nombre: c.nombre,
    })),
    centrosValidarRuta: row.centrosValidarRuta.map((c) => ({
      id: c.id,
      nombre: c.nombre,
    })),
    tieneLogistico: row.logistico !== null,
    tieneSupervisor: row.supervisor !== null,
    tieneAdministrador: row.administrador !== null,
  });
}

@Injectable()
export class PrismaCoordinadorRepository implements CoordinadorRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<Coordinador[]> {
    const rows = await this.prisma.coordinadorLogistico.findMany({
      include: COORDINADOR_INCLUDE,
      orderBy: { idUser: 'asc' },
    });
    return rows.map((row) => aDominio(row as CoordinadorRow));
  }

  async buscarPorId(id: number): Promise<Coordinador | null> {
    const row = await this.prisma.coordinadorLogistico.findUnique({
      where: { idUser: id },
      include: COORDINADOR_INCLUDE,
    });
    return row ? aDominio(row as CoordinadorRow) : null;
  }

  async actualizar(
    id: number,
    actual: Coordinador,
    input: ActualizarCoordinadorPersistenciaInput,
  ): Promise<Coordinador> {
    const { nombre, especialidad, centrosCrearIds, centrosValidarIds } = input;
    const cambiaEspecialidad =
      especialidad !== undefined && especialidad !== actual.especialidad;

    await this.prisma.$transaction(async (tx) => {
      if (nombre !== undefined) {
        await tx.usuario.update({
          where: { id },
          data: { nombre },
        });
      }

      await tx.coordinadorLogistico.update({
        where: { idUser: id },
        data: {
          ...(nombre !== undefined ? { nombre } : {}),
          ...(especialidad !== undefined
            ? { especialidad: especialidad as RolCoordinador }
            : {}),
          ...(centrosCrearIds !== undefined
            ? {
                centrosCrearRuta: {
                  set: centrosCrearIds.map((centroId) => ({ id: centroId })),
                },
              }
            : {}),
          ...(centrosValidarIds !== undefined
            ? {
                centrosValidarRuta: {
                  set: centrosValidarIds.map((centroId) => ({ id: centroId })),
                },
              }
            : {}),
        },
      });

      if (cambiaEspecialidad) {
        // Un coordinador solo puede tener una fila de subtipo: se borra
        // la anterior y se crea la que corresponde a la nueva especialidad.
        await tx.logistico.deleteMany({ where: { id } });
        await tx.supervisorLogistico.deleteMany({ where: { id } });
        await tx.administrador.deleteMany({ where: { id } });

        const nombreFinal = nombre ?? actual.nombre;

        if (especialidad === 'LOGISTICO') {
          await tx.logistico.create({ data: { id, nombre: nombreFinal } });
        } else if (especialidad === 'SUPERVISOR') {
          await tx.supervisorLogistico.create({
            data: { id, nombre: nombreFinal },
          });
        } else if (especialidad === 'ADMINISTRADOR') {
          await tx.administrador.create({
            data: { id, nombre: nombreFinal },
          });
        }
      } else if (nombre !== undefined) {
        await tx.logistico.updateMany({ where: { id }, data: { nombre } });
        await tx.supervisorLogistico.updateMany({
          where: { id },
          data: { nombre },
        });
        await tx.administrador.updateMany({ where: { id }, data: { nombre } });
      }
    });

    const actualizado = await this.buscarPorId(id);
    // buscarPorId solo devuelve null si el registro desapareció durante la tx;
    // en este flujo eso no debería ocurrir.
    return actualizado!;
  }

  async contarAsignaciones(id: number): Promise<number> {
    return this.prisma.asignar.count({ where: { idcoordinador: id } });
  }

  async contarReprogramacionesPendientes(id: number): Promise<number> {
    // Solo bloquean las reprogramaciones que aún no se han reprogramado.
    return this.prisma.reprogramar.count({
      where: { idCoordinador: id, resultado: false },
    });
  }

  async eliminar(id: number): Promise<Coordinador> {
    const coordinador = await this.buscarPorId(id);

    await this.prisma.$transaction(async (tx) => {
      // Las reprogramaciones ya completadas tienen una FK RESTRICT hacia
      // el coordinador: se eliminan para poder borrar el usuario,
      // conservando la regla de que solo las pendientes bloquean.
      await tx.reprogramar.deleteMany({
        where: { idCoordinador: id, resultado: true },
      });

      // Al borrar el Usuario se elimina en cascada el CoordinadorLogistico
      // y su fila de subtipo (Logistico / Supervisor / Administrador).
      await tx.usuario.delete({ where: { id } });
    });

    return coordinador!;
  }
}
