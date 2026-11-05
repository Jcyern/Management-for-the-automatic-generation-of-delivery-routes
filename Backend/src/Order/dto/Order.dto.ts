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
} from '../../generated/prisma/client.js';

/**
 * DTO para crear un pedido.
 *
 * Los campos con valor por defecto en el schema (prioridad, tipoEntrega,
 * fechaPrevista, estado) son opcionales aquí.
 * Las relaciones se envían por clave foránea: idCentro, idCoordinador,
 * idZona, idParada e idRuta.
 */

export class CreateOrderDto {
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

  @IsInt()
  @IsPositive()
  idParada: number;

  @IsInt()
  @IsPositive()
  idRuta: number;

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

/**
 * DTO para actualizar un pedido.
 * Todos los campos son opcionales; solo se actualiza lo que se envía.
 */
export class UpdateOrderDto {
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

/**
 * DTO para filtrar el listado de pedidos.
 */
export class FilterOrderDto {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}