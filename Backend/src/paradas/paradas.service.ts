import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import type { Parada } from '../generated/prisma/client.js';
import { CrearParadaDto } from './dto/crear-parada.dto.js';

const ESTADO_INICIAL = 'PENDIENTE';

@Injectable()
export class ParadasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearParadaDto): Promise<Parada> {
    if (dto.idPedido !== undefined) {
      const pedido = await this.prisma.pedido.findUnique({ where: { id: dto.idPedido } });
      if (!pedido) {
        throw new NotFoundException(`No existe el pedido ${dto.idPedido}`);
      }
    }
    return this.prisma.parada.create({
      data: {
        estadoEjecucion: dto.estadoEjecucion ?? ESTADO_INICIAL,
        idPedido: dto.idPedido ?? null,
      },
    });
  }
}
