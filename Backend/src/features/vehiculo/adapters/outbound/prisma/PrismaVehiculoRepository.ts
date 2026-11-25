import { Injectable } from '@nestjs/common';
import { Vehiculo } from '../../../domain/Vehiculo.js';
import type { VehiculoRepositoryPort, VehiculoConRelaciones } from '../../../application/ports/VehiculoRepositoryPort.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';

@Injectable()
export class PrismaVehiculoRepository implements VehiculoRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(v: Vehiculo): Promise<Vehiculo> {
    const row = v.id === null
      ? await this.prisma.vehiculo.create({ data: { capacidad: v.capacidad, flotaID: v.idFlota } })
      : await this.prisma.vehiculo.update({ where: { id: v.id }, data: { capacidad: v.capacidad, flotaID: v.idFlota } });
    return Vehiculo.rehidratar({ id: row.id, capacidad: row.capacidad, idFlota: row.flotaID });
  }

  async buscarPorId(id: number): Promise<Vehiculo | null> {
    const row = await this.prisma.vehiculo.findUnique({ where: { id } });
    return row ? Vehiculo.rehidratar({ id: row.id, capacidad: row.capacidad, idFlota: row.flotaID }) : null;
  }

  async listar(): Promise<VehiculoConRelaciones[]> {
    const rows = await this.prisma.vehiculo.findMany({
      include: { flota: { select: { id: true, nombre: true } } },
      orderBy: { id: 'asc' }
    });
    return rows.map(r => ({ id: r.id, capacidad: r.capacidad, idFlota: r.flotaID, flota: r.flota }));
  }

  async obtenerConRelaciones(id: number): Promise<VehiculoConRelaciones | null> {
    const r = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: { flota: { select: { id: true, nombre: true } } }
    });
    if (!r) return null;
    return { id: r.id, capacidad: r.capacidad, idFlota: r.flotaID, flota: r.flota };
  }

  async tieneRutasRealizadas(id: number): Promise<boolean> {
    const row = await this.prisma.vehiculo.findUnique({
      where: { id },
      select: { _count: { select: { rutasRealizadas: true } } },
    });
    return !!row && row._count.rutasRealizadas > 0;
  }

  async eliminar(id: number): Promise<Vehiculo> {
    const row = await this.prisma.vehiculo.delete({ where: { id } });
    return Vehiculo.rehidratar({ id: row.id, capacidad: row.capacidad, idFlota: row.flotaID });
  }
}