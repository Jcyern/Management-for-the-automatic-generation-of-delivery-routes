import { Injectable } from '@nestjs/common';
import { Repartidor } from '../../../domain/Repartidor.js';
import type { RepartidorRepositoryPort, RepartidorConRelaciones } from '../../../application/ports/RepartidorRepositoryPort.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';

@Injectable()
export class PrismaRepartidorRepository implements RepartidorRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(r: Repartidor): Promise<Repartidor> {
    const data = {
      nombre: r.nombre,
      edad: r.edad,
      idFlota: r.idFlota,
      centros: { set: r.centrosIds.map(id => ({ id })) },
    };

    const row = await this.prisma.repartidor.upsert({
      where: { idUser: r.idUser },
      create: { 
        idUser: r.idUser,
        nombre: r.nombre,
        edad: r.edad,
        idFlota: r.idFlota,
        centros: { connect: r.centrosIds.map((id) => ({ id })) },
      },
      update: {
        nombre: r.nombre,
        edad: r.edad,
        idFlota: r.idFlota,
        centros: { set: r.centrosIds.map((id) => ({ id })) },
      },
    });

    return Repartidor.rehidratar({
      idUser: row.idUser, nombre: row.nombre, edad: row.edad, idFlota: row.idFlota,
      centrosIds: r.centrosIds,
    });
  }

  async buscarPorId(idUser: number): Promise<Repartidor | null> {
    const row = await this.prisma.repartidor.findUnique({
      where: { idUser },
      include: { centros: { select: { id: true } } },
    });
    if (!row) return null;
    return Repartidor.rehidratar({
      idUser: row.idUser, nombre: row.nombre, edad: row.edad, idFlota: row.idFlota,
      centrosIds: row.centros.map(c => c.id),
    });
  }

  async listar(): Promise<RepartidorConRelaciones[]> {
    const rows = await this.prisma.repartidor.findMany({
      include: { flota: { select: { id: true, nombre: true } }, centros: { select: { id: true, nombre: true } } },
    });
    return rows.map(this.mapearConRelaciones);
  }

  async obtenerConRelaciones(idUser: number): Promise<RepartidorConRelaciones | null> {
    const row = await this.prisma.repartidor.findUnique({
      where: { idUser },
      include: { flota: { select: { id: true, nombre: true } }, centros: { select: { id: true, nombre: true } } },
    });
    return row ? this.mapearConRelaciones(row) : null;
  }

  async tieneDependencias(idUser: number): Promise<boolean> {
    const row = await this.prisma.repartidor.findUnique({
      where: { idUser },
      select: { _count: { select: { rutasAsignadas: true, rutasRealizadas: true } } },
    });
    return !!row && (row._count.rutasAsignadas > 0 || row._count.rutasRealizadas > 0);
  }

  async eliminar(idUser: number): Promise<Repartidor> {
    const row = await this.prisma.repartidor.delete({ where: { idUser } });
    return Repartidor.rehidratar({ idUser: row.idUser, nombre: row.nombre, edad: row.edad, idFlota: row.idFlota, centrosIds: [] });
  }

  private mapearConRelaciones(r: any): RepartidorConRelaciones {
    return { idUser: r.idUser, nombre: r.nombre, edad: r.edad, flota: r.flota, centros: r.centros };
  }
}