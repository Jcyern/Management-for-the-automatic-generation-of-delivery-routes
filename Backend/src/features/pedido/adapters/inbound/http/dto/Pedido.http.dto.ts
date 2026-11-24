import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  EstadoPedido,
  Prioridad,
  TipoPedido,
} from '../../../../../../generated/prisma/client.js';
import type {
  EstadoPedidoDominio,
  PrioridadPedido,
  TipoEntregaPedido,
} from '../../../../domain/Pedido.js';

/**
 * DTO HTTP para crear un pedido. Se mantiene la forma del antiguo
 * `CreateOrderDto`; la ruta pública sigue siendo `/order`.
 */
export class CreatePedidoHttpDto {
  @IsOptional()
  @IsEnum(Prioridad)
  prioridad?: Prioridad;

  @IsOptional()
  @IsEnum(TipoPedido)
  tipoEntrega?: TipoPedido;

  @IsString()
  @IsNotEmpty()
  destinatario: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsInt()
  @IsPositive()
  idCentro: number;

  @IsInt()
  @IsPositive()
  idCoordinador: number;

  @IsInt()
  @IsPositive()
  idZona: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idParada?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idRuta?: number;

  @IsOptional()
  @IsDateString()
  fechaPrevista?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}

/** DTO HTTP para actualizar un pedido. Todos los campos son opcionales. */
export class UpdatePedidoHttpDto {
  @IsOptional()
  @IsEnum(Prioridad)
  prioridad?: Prioridad;

  @IsOptional()
  @IsEnum(TipoPedido)
  tipoEntrega?: TipoPedido;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  destinatario?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  direccion?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idCentro?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idCoordinador?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idZona?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idParada?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idRuta?: number;

  @IsOptional()
  @IsDateString()
  fechaPrevista?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}

/** Filtro opcional por estado en `GET /order`. `null` devuelve todos. */
export class FilterPedidoHttpDto {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido | null;
}

// Los enums del cliente Prisma y los del dominio tienen los mismos valores;
// estos aliases documentan la conversión que hace el controller.
export type PrioridadHttp = PrioridadPedido;
export type TipoEntregaHttp = TipoEntregaPedido;
export type EstadoPedidoHttp = EstadoPedidoDominio;
