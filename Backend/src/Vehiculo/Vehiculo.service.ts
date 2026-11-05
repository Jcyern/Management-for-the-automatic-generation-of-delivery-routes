import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { CreateVehiculoDto, UpdateVehiculoDto } from './dto/Vehiculo.dto.js';

@Injectable()
export class VehiculoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVehiculoDto) {
    const flotaExiste = await this.prisma.flota.findUnique({
      where: { id: dto.flotaID },
    });
    if (!flotaExiste) {
      throw new BadRequestException(`La flota con ID ${dto.flotaID} no existe.`);
    }

    return this.prisma.vehiculo.create({
      data: {
        capacidad: dto.capacidad,
        flota: { connect: { id: dto.flotaID } }
      },
      include: { flota: true }
    });
  }

  async findAll() {
    return this.prisma.vehiculo.findMany({
      include: { flota: true },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: { flota: true }
    });
    if (!vehiculo) throw new NotFoundException(`Vehículo ${id} no encontrado`);
    return vehiculo;
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    await this.findOne(id);

    if (dto.flotaID) {
      const flotaExiste = await this.prisma.flota.findUnique({
        where: { id: dto.flotaID },
      });
      if (!flotaExiste) {
        throw new BadRequestException(`La flota con ID ${dto.flotaID} no existe.`);
      }
    }

    return this.prisma.vehiculo.update({
      where: { id },
      data: {
        capacidad: dto.capacidad,
        flota: dto.flotaID ? { connect: { id: dto.flotaID } } : undefined
      },
      include: { flota: true }
    });
  }

  async remove(id: number) {
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: {
        _count: { select: { rutasRealizadas: true } }
      },
    });

    if (!vehiculo) throw new NotFoundException(`Vehículo ${id} no encontrado`);

    if (vehiculo._count.rutasRealizadas > 0) {
      throw new BadRequestException(
        'No se puede eliminar el vehículo porque tiene rutas asociadas.'
      );
    }

    return this.prisma.vehiculo.delete({ where: { id } });
  }
}