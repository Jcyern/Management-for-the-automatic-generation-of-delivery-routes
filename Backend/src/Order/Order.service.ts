import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto } from './dto/Order.dto.js';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { EstadoPedido } from '../generated/prisma/client.js';


@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    return this.prisma.pedido.create({
      data: {
        ...(dto.prioridad !== undefined
          ? { prioridad: dto.prioridad }
          : {}),
        ...(dto.tipoEntrega !== undefined
          ? { tipoEntrega: dto.tipoEntrega }
          : {}),
        destinatario: dto.destinatario,
        direccion: dto.direccion,
        idCentro: dto.idCentro,
        idCoordinador: dto.idCoordinador,
        idZona: dto.idZona,
        idParada: dto.idParada,
        idRuta: dto.idRuta,
        ...(dto.fechaPrevista !== undefined
          ? { fechaPrevista: new Date(dto.fechaPrevista) }
          : {}),
        ...(dto.fechaEntrega !== undefined
          ? { fechaEntrega: new Date(dto.fechaEntrega) }
          : {}),
        ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      },
      include: { centro: true, coordinador: true },
    });
  }

    // Devuelve todos los pedidos. Si se pasa `estado`, filtra por ese estado.
    async findAll(estado?: EstadoPedido) {
        return this.prisma.pedido.findMany({
        where: estado !== undefined ? { estado } : {},
        include: { centro: true, coordinador: true },
        });
    }

    // Devuelve un pedido por su id (404 si no existe).
    async findOne(id: number) {
        const pedido = await this.prisma.pedido.findUnique({
        where: { id },
        include: { centro: true, coordinador: true },
        });

        if (!pedido) {
        throw new NotFoundException(`Pedido ${id} not found`);
        }

        return pedido;
    }

    // Actualiza un pedido (404 si no existe).
    async update(id: number, dto: UpdateOrderDto) {
        await this.findOne(id);

        return this.prisma.pedido.update({
        where: { id },
        data: {
            ...(dto.prioridad !== undefined
            ? { prioridad: dto.prioridad }
            : {}),
            ...(dto.tipoEntrega !== undefined
            ? { tipoEntrega: dto.tipoEntrega }
            : {}),
            ...(dto.destinatario !== undefined
            ? { destinatario: dto.destinatario }
            : {}),
            ...(dto.direccion !== undefined
            ? { direccion: dto.direccion }
            : {}),
            ...(dto.idCentro !== undefined
            ? { idCentro: dto.idCentro }
            : {}),
            ...(dto.idCoordinador !== undefined
            ? { idCoordinador: dto.idCoordinador }
            : {}),
            ...(dto.idZona !== undefined ? { idZona: dto.idZona } : {}),
            ...(dto.idParada !== undefined ? { idParada: dto.idParada } : {}),
            ...(dto.idRuta !== undefined ? { idRuta: dto.idRuta } : {}),
            ...(dto.fechaPrevista !== undefined
            ? { fechaPrevista: new Date(dto.fechaPrevista) }
            : {}),
            ...(dto.fechaEntrega !== undefined
            ? { fechaEntrega: new Date(dto.fechaEntrega) }
            : {}),
            ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
        },
        include: { centro: true, coordinador: true },
        });
    }

    // Elimina un pedido (404 si no existe). Devuelve el pedido borrado con sus relaciones.
    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.pedido.delete({
        where: { id },
        include: { centro: true, coordinador: true },
        });
    }
}
