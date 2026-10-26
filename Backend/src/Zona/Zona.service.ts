import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { CreateZonaDto, UpdateZonaDto } from './dto/Zona.dto.js';

@Injectable()
export class ZonaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateZonaDto) {
    return this.prisma.zona.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.zona.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const zona = await this.prisma.zona.findUnique({ where: { id } });
    if (!zona) throw new NotFoundException(`Zona ${id} not found`);
    return zona;
  }

  async update(id: number, dto: UpdateZonaDto) {
    await this.findOne(id);
    return this.prisma.zona.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.zona.delete({
      where: { id },
    });
  }
}