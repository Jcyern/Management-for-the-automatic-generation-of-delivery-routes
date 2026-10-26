import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { CreateCentroDto, UpdateCentroDto } from './dto/Centro.dto.js';

@Injectable()
export class CentroService {
  constructor(private prisma: PrismaService) {}

  // Comprueba si el coordinador está autorizado para gestionar este centro
  private async verificarAutorizacion(centroId: number, userId: number) {
    const centroAutorizado = await this.prisma.centroDeDistribucion.findFirst({
      where: {
        id: centroId,
        OR: [
          { coordinadorCrearRutas: { some: { idUser: userId } } },
          { coordinadorValidadRutas: { some: { idUser: userId } } },
        ],
      },
    });

    if (!centroAutorizado) {
      throw new ForbiddenException(
        'No estás autorizado para gestionar este centro de distribución.',
      );
    }
  }

  async create(dto: CreateCentroDto, userId: number) {
    const { zonasIds, ...data } = dto;

    // Comprueba que el nombre sea único
    const existeNombre = await this.prisma.centroDeDistribucion.findFirst({
      where: { nombre: data.nombre },
    });
    if (existeNombre) {
      throw new ConflictException(
        `Ya existe un centro con el nombre ${data.nombre}`,
      );
    }

    // Crea el centro, asocia zonas y auto-asigna al coordinador creador
    return this.prisma.centroDeDistribucion.create({
      data: {
        ...data,
        zonas: zonasIds
          ? { connect: zonasIds.map((id) => ({ id })) }
          : undefined,
        coordinadorCrearRutas: { connect: { idUser: userId } },
      },
      include: { zonas: true },
    });
  }

  async findAll(userId: number) {
    // Filtra para que el coordinador solo vea los centros donde está autorizado
    return this.prisma.centroDeDistribucion.findMany({
      where: {
        OR: [
          { coordinadorCrearRutas: { some: { idUser: userId } } },
          { coordinadorValidadRutas: { some: { idUser: userId } } },
        ],
      },
      include: { zonas: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const centro = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      include: { zonas: true },
    });
    if (!centro) throw new NotFoundException(`Centro ${id} not found`);
    return centro;
  }

  async update(id: number, dto: UpdateCentroDto, userId: number) {
    await this.findOne(id);
    await this.verificarAutorizacion(id, userId);

    const { zonasIds, ...data } = dto;

    // Valida que el nombre sea único en caso de que se intente cambiar
    if (data.nombre) {
      const existeNombre = await this.prisma.centroDeDistribucion.findFirst({
        where: { nombre: data.nombre, id: { not: id } },
      });
      if (existeNombre) {
        throw new ConflictException(
          `Ya existe otro centro con el nombre ${data.nombre}`,
        );
      }
    }

    return this.prisma.centroDeDistribucion.update({
      where: { id },
      data: {
        ...data,
        zonas: zonasIds ? { set: zonasIds.map((id) => ({ id })) } : undefined,
      },
      include: { zonas: true },
    });
  }

  async remove(id: number, userId: number) {
    // Comprueba que no tenga pedidos ni repartidores asociados antes de borrarlo
    const centro = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      include: { _count: { select: { pedidos: true, repartidores: true } } },
    });

    if (!centro) throw new NotFoundException(`Centro ${id} not found`);

    await this.verificarAutorizacion(id, userId);

    if (centro._count.pedidos > 0 || centro._count.repartidores > 0) {
      throw new BadRequestException(
        `No se puede eliminar el centro porque tiene pedidos o repartidores asociados.`,
      );
    }

    return this.prisma.centroDeDistribucion.delete({
      where: { id },
    });
  }
}
