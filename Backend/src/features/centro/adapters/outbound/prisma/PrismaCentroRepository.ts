import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';
import { ReglaDeNegocioViolada } from '../../../../../shared/domain/DomainError.js';
import { Centro } from '../../../domain/Centro.js';
import type { CentroRepositoryPort } from '../../../application/ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../../../application/ports/CentroQueryPort.js';
import type { CentroConZonas } from '../../../application/models/CentroConZonas.js';

type CentroRow = {
  id: number;
  nombre: string;
  programaLogistico: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
};

type CentroConZonasIdsRow = CentroRow & { zonas: Array<{ id: number }> };
type CentroConZonasNombresRow = CentroRow & {
  zonas: Array<{ id: number; nombre: string }>;
};

function aCentro(row: CentroConZonasIdsRow): Centro {
  return Centro.rehidratar({
    id: row.id,
    nombre: row.nombre,
    programaLogistico: row.programaLogistico,
    direccion: row.direccion,
    latitud: row.latitud,
    longitud: row.longitud,
    zonasIds: row.zonas.map((zona) => zona.id),
  });
}

function aReadModel(row: CentroConZonasNombresRow): CentroConZonas {
  return { centro: aCentro(row), zonas: row.zonas };
}

function esZonaInexistente(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

@Injectable()
export class PrismaCentroRepository
  implements CentroRepositoryPort, CentroQueryPort
{
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async crear(centro: Centro, creadorId: number): Promise<Centro> {
    try {
      const row = await this.prisma.centroDeDistribucion.create({
        data: {
          nombre: centro.nombre,
          programaLogistico: centro.programaLogistico,
          direccion: centro.direccion,
          latitud: centro.latitud,
          longitud: centro.longitud,
          zonas: { connect: centro.zonasIds.map((id) => ({ id })) },
          coordinadorCrearRutas: { connect: { idUser: creadorId } },
        },
        include: { zonas: { select: { id: true } } },
      });
      return aCentro(row);
    } catch (error) {
      if (esZonaInexistente(error)) {
        throw new ReglaDeNegocioViolada(
          'Alguna de las zonas indicadas no existe.',
        );
      }
      throw error;
    }
  }

  async actualizar(centro: Centro): Promise<Centro> {
    const { id } = centro;
    if (id === null) {
      throw new Error('No se puede actualizar un centro sin id.');
    }

    try {
      const row = await this.prisma.centroDeDistribucion.update({
        where: { id },
        data: {
          nombre: centro.nombre,
          programaLogistico: centro.programaLogistico,
          direccion: centro.direccion,
          latitud: centro.latitud,
          longitud: centro.longitud,
          zonas: { set: centro.zonasIds.map((zonaId) => ({ id: zonaId })) },
        },
        include: { zonas: { select: { id: true } } },
      });
      return aCentro(row);
    } catch (error) {
      if (esZonaInexistente(error)) {
        throw new ReglaDeNegocioViolada(
          'Alguna de las zonas indicadas no existe.',
        );
      }
      throw error;
    }
  }

  async buscarPorId(id: number): Promise<Centro | null> {
    const row = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      include: { zonas: { select: { id: true } } },
    });
    return row ? aCentro(row) : null;
  }

  async existeNombre(nombre: string, excluirId?: number): Promise<boolean> {
    const row = await this.prisma.centroDeDistribucion.findFirst({
      where: {
        nombre,
        ...(excluirId !== undefined ? { id: { not: excluirId } } : {}),
      },
      select: { id: true },
    });
    return row !== null;
  }

  async estaAutorizado(id: number, userId: number): Promise<boolean> {
    const row = await this.prisma.centroDeDistribucion.findFirst({
      where: {
        id,
        OR: [
          { coordinadorCrearRutas: { some: { idUser: userId } } },
          { coordinadorValidadRutas: { some: { idUser: userId } } },
          { repartidores: { some: { idUser: userId } } },
        ],
      },
      select: { id: true },
    });
    return row !== null;
  }

  async tieneDependencias(id: number): Promise<boolean> {
    const row = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      select: {
        _count: { select: { pedidos: true, repartidores: true } },
      },
    });
    if (!row) return false;
    return row._count.pedidos > 0 || row._count.repartidores > 0;
  }

  async eliminar(id: number): Promise<void> {
    await this.prisma.centroDeDistribucion.delete({ where: { id } });
  }

  async buscarPorIdConZonas(id: number): Promise<CentroConZonas | null> {
    const row = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      include: { zonas: { select: { id: true, nombre: true } } },
    });
    return row ? aReadModel(row) : null;
  }

  async listarPorCoordinador(userId: number): Promise<CentroConZonas[]> {
    const rows = await this.prisma.centroDeDistribucion.findMany({
      where: {
        OR: [
          { coordinadorCrearRutas: { some: { idUser: userId } } },
          { coordinadorValidadRutas: { some: { idUser: userId } } },
          { repartidores: { some: { idUser: userId } } },
        ],
      },
      include: { zonas: { select: { id: true, nombre: true } } },
      orderBy: { id: 'asc' },
    });
    return rows.map(aReadModel);
  }

  async listarTodos(): Promise<CentroConZonas[]> {
    const rows = await this.prisma.centroDeDistribucion.findMany({
      include: { zonas: { select: { id: true, nombre: true } } },
      orderBy: { id: 'asc' },
    });
    return rows.map(aReadModel);
  }
}
