import { Injectable } from '@nestjs/common';
import { Flota } from '../../../domain/Flota.js';
import type { FlotaRepositoryPort, FlotaConRelaciones } from '../../../application/ports/FlotaRepositoryPort.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';

@Injectable()
export class PrismaFlotaRepository implements FlotaRepositoryPort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async guardar(flota: Flota): Promise<Flota> {
    const id = flota.id;
    const row =
      id === null
        ? await this.prisma.flota.create({ data: { nombre: flota.nombre } })
        : await this.prisma.flota.update({
            where: { id },
            data: { nombre: flota.nombre },
          });

    return Flota.rehidratar({ id: row.id, nombre: row.nombre });
  }

  async buscarPorId(id: number): Promise<Flota | null> {
    const row = await this.prisma.flota.findUnique({ where: { id } });
    return row ? Flota.rehidratar({ id: row.id, nombre: row.nombre }) : null;
  }

  async buscarPorNombre(nombre: string): Promise<Flota | null> {
    const row = await this.prisma.flota.findFirst({ where: { nombre } });
    return row ? Flota.rehidratar({ id: row.id, nombre: row.nombre }) : null;
  }

  async listar(): Promise<FlotaConRelaciones[]> {
    const rows = await this.prisma.flota.findMany({
      include: { vehiculos: true, repartidores: true },
      orderBy: { id: 'asc' },
    });
    return rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      vehiculos: r.vehiculos,
      repartidores: r.repartidores,
    }));
  }

  async obtenerConRelaciones(id: number): Promise<FlotaConRelaciones | null> {
    const row = await this.prisma.flota.findUnique({
      where: { id },
      include: { vehiculos: true, repartidores: true },
    });
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      vehiculos: row.vehiculos,
      repartidores: row.repartidores,
    };
  }

  async tieneDependencias(id: number): Promise<boolean> {
    const row = await this.prisma.flota.findUnique({
      where: { id },
      select: { _count: { select: { vehiculos: true, repartidores: true } } },
    });
    if (!row) return false;
    return row._count.vehiculos > 0 || row._count.repartidores > 0;
  }

  async eliminar(id: number): Promise<Flota> {
    const row = await this.prisma.flota.delete({ where: { id } });
    return Flota.rehidratar({ id: row.id, nombre: row.nombre });
  }
}