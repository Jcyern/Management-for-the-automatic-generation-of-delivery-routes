import { Injectable } from '@nestjs/common';
import { Zona } from '../../../domain/Zona.js';
import type { ZonaRepositoryPort } from '../../../application/ports/ZonaRepositoryPort.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';

@Injectable()
export class PrismaZonaRepository implements ZonaRepositoryPort {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async guardar(zona: Zona): Promise<Zona> {
    const id = zona.id;
    const row =
      id === null
        ? await this.prisma.zona.create({ data: { nombre: zona.nombre } })
        : await this.prisma.zona.update({
            where: { id },
            data: { nombre: zona.nombre },
          });

    return Zona.rehidratar({ id: row.id, nombre: row.nombre });
  }

  async buscarPorId(id: number): Promise<Zona | null> {
    const row = await this.prisma.zona.findUnique({ where: { id } });
    return row ? Zona.rehidratar({ id: row.id, nombre: row.nombre }) : null;
  }

  async listar(): Promise<Zona[]> {
    const rows = await this.prisma.zona.findMany({ orderBy: { id: 'asc' } });
    return rows.map((row) => Zona.rehidratar({ id: row.id, nombre: row.nombre }));
  }

  async tieneDependencias(id: number): Promise<boolean> {
    const row = await this.prisma.zona.findUnique({
      where: { id },
      select: { _count: { select: { pedidos: true, rutas: true } } },
    });
    if (!row) return false;
    return row._count.pedidos > 0 || row._count.rutas > 0;
  }

  async eliminar(id: number): Promise<Zona> {
    const row = await this.prisma.zona.delete({ where: { id } });
    return Zona.rehidratar({ id: row.id, nombre: row.nombre });
  }
}
