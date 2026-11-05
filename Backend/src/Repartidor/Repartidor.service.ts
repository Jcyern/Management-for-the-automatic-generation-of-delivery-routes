import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { CreateRepartidorDto, UpdateRepartidorDto } from './dto/Repartidor.dto.js';

@Injectable()
export class RepartidorService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRepartidorDto) {
    const { centrosIds, ...data } = dto;

    const flotaExiste = await this.prisma.flota.findUnique({ where: { id: dto.idFlota } });
    if (!flotaExiste) throw new BadRequestException(`La flota con ID ${dto.idFlota} no existe.`);

    const userExiste = await this.prisma.usuario.findUnique({ where: { id: dto.idUser } });
    if (!userExiste) throw new BadRequestException(`El usuario con ID ${dto.idUser} no existe.`);

    return this.prisma.repartidor.create({
      data: {
        ...data,
        centros: centrosIds ? { connect: centrosIds.map(id => ({ id })) } : undefined,
      },
      include: { flota: true, centros: true }
    });
  }

  async findAll() {
    return this.prisma.repartidor.findMany({
      include: { flota: true, centros: true },
      orderBy: { idUser: 'asc' }
    });
  }

  async findOne(idUser: number) {
    const repartidor = await this.prisma.repartidor.findUnique({
      where: { idUser },
      include: { flota: true, centros: true, rutasAsignadas: true }
    });
    if (!repartidor) throw new NotFoundException(`Repartidor ${idUser} no encontrado`);
    return repartidor;
  }

  async update(idUser: number, dto: UpdateRepartidorDto) {
    await this.findOne(idUser);
    const { centrosIds, ...data } = dto;

    if (dto.idFlota) {
      const flotaExiste = await this.prisma.flota.findUnique({ where: { id: dto.idFlota } });
      if (!flotaExiste) throw new BadRequestException(`La flota con ID ${dto.idFlota} no existe.`);
    }

    return this.prisma.repartidor.update({
      where: { idUser },
      data: {
        ...data,
        centros: centrosIds ? { set: centrosIds.map(id => ({ id })) } : undefined,
      },
      include: { flota: true, centros: true }
    });
  }

  async remove(idUser: number) {
    const repartidor = await this.prisma.repartidor.findUnique({
      where: { idUser },
      include: {
        _count: { select: { rutasAsignadas: true, rutasRealizadas: true } }
      },
    });

    if (!repartidor) throw new NotFoundException(`Repartidor ${idUser} no encontrado`);

    if (repartidor._count.rutasAsignadas > 0 || repartidor._count.rutasRealizadas > 0) {
      throw new BadRequestException('No se puede eliminar el repartidor porque tiene rutas asociadas.');
    }

    return this.prisma.repartidor.delete({ where: { idUser } });
  }
}