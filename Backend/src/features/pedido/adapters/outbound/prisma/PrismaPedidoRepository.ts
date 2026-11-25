import { Injectable } from '@nestjs/common';
import {
  EstadoPedido,
  Prioridad,
  RolCoordinador,
  TipoPedido,
} from '../../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';
import {
  Pedido,
  type EstadoPedidoDominio,
} from '../../../domain/Pedido.js';
import type { PedidoRepositoryPort } from '../../../application/ports/PedidoRepositoryPort.js';

const PEDIDO_INCLUDE = {
  centro: true,
  coordinador: true,
} as const;

interface PedidoRow {
  id: number;
  prioridad: Prioridad;
  tipoEntrega: TipoPedido;
  fechaPrevista: Date;
  fechaEntrega: Date | null;
  estado: EstadoPedido;
  destinatario: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  idParada: number | null;
  idCentro: number;
  idCoordinador: number;
  idRuta: number | null;
  idZona: number;
  centro: {
    id: number;
    nombre: string;
    programaLogistico: string;
    direccion: string | null;
    latitud: number | null;
    longitud: number | null;
  };
  coordinador: {
    idUser: number;
    nombre: string;
    especialidad: RolCoordinador;
  };
}

function aDominio(row: PedidoRow): Pedido {
  return Pedido.rehidratar({
    id: row.id,
    prioridad: row.prioridad,
    tipoEntrega: row.tipoEntrega,
    fechaPrevista: row.fechaPrevista,
    fechaEntrega: row.fechaEntrega,
    estado: row.estado,
    destinatario: row.destinatario,
    direccion: row.direccion,
    coordenadas:
      row.latitud !== null && row.longitud !== null
        ? { latitud: row.latitud, longitud: row.longitud }
        : null,
    idParada: row.idParada,
    idCentro: row.idCentro,
    idCoordinador: row.idCoordinador,
    idRuta: row.idRuta,
    idZona: row.idZona,
    centro: { ...row.centro },
    coordinador: { ...row.coordinador },
  });
}

@Injectable()
export class PrismaPedidoRepository implements PedidoRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(pedido: Pedido): Promise<Pedido> {
    const data = {
      ...(pedido.prioridad !== null
        ? { prioridad: pedido.prioridad as Prioridad }
        : {}),
      ...(pedido.tipoEntrega !== null
        ? { tipoEntrega: pedido.tipoEntrega as TipoPedido }
        : {}),
      ...(pedido.fechaPrevista !== null
        ? { fechaPrevista: pedido.fechaPrevista }
        : {}),
      fechaEntrega: pedido.fechaEntrega,
      ...(pedido.estado !== null
        ? { estado: pedido.estado as EstadoPedido }
        : {}),
      destinatario: pedido.destinatario,
      direccion: pedido.direccion,
      latitud: pedido.coordenadas?.latitud ?? null,
      longitud: pedido.coordenadas?.longitud ?? null,
      idParada: pedido.idParada,
      idCentro: pedido.idCentro,
      idCoordinador: pedido.idCoordinador,
      idRuta: pedido.idRuta,
      idZona: pedido.idZona,
    };

    const row =
      pedido.id === null
        ? await this.prisma.pedido.create({ data, include: PEDIDO_INCLUDE })
        : await this.prisma.pedido.update({
            where: { id: pedido.id },
            data,
            include: PEDIDO_INCLUDE,
          });

    return aDominio(row as PedidoRow);
  }

  async buscarPorId(id: number): Promise<Pedido | null> {
    const row = await this.prisma.pedido.findUnique({
      where: { id },
      include: PEDIDO_INCLUDE,
    });
    return row ? aDominio(row as PedidoRow) : null;
  }

  async listar(estado?: EstadoPedidoDominio | null): Promise<Pedido[]> {
    const rows = await this.prisma.pedido.findMany({
      where: estado != null ? { estado: estado as EstadoPedido } : {},
      include: PEDIDO_INCLUDE,
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => aDominio(row as PedidoRow));
  }

  async eliminar(id: number): Promise<Pedido> {
    const row = await this.prisma.pedido.delete({
      where: { id },
      include: PEDIDO_INCLUDE,
    });
    return aDominio(row as PedidoRow);
  }
}
