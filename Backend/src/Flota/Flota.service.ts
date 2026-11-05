import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { CreateFlotaDto, UpdateFlotaDto } from './dto/Flota.dto.js';

@Injectable()
export class FlotaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFlotaDto) {
    const existe = await this.prisma.flota.findFirst({ where: { nombre: dto.nombre } });
    if (existe) throw new BadRequestException(`Ya existe una flota con el nombre ${dto.nombre}`);

    return this.prisma.flota.create({ data: dto });
  }

  async findAll() {
    return this.prisma.flota.findMany({
      include: { 
        vehiculos: true, 
        repartidores: true 
      },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const flota = await this.prisma.flota.findUnique({ 
      where: { id },
      include: { vehiculos: true, repartidores: true }
    });
    if (!flota) throw new NotFoundException(`Flota ${id} no encontrada`);
    return flota;
  }

  async update(id: number, dto: UpdateFlotaDto) {
    await this.findOne(id);
    return this.prisma.flota.update({ 
      where: { id }, 
      data: dto 
    });
  }

  async remove(id: number) {
    const flota = await this.prisma.flota.findUnique({
      where: { id },
      include: { 
        _count: { select: { vehiculos: true, repartidores: true } } 
      },
    });

    if (!flota) throw new NotFoundException(`Flota ${id} no encontrada`);

    if (flota._count.vehiculos > 0 || flota._count.repartidores > 0) {
      throw new BadRequestException(
        'No se puede eliminar la flota porque tiene vehículos o repartidores asociados.'
      );
    }

    return this.prisma.flota.delete({ where: { id } });
  }
}