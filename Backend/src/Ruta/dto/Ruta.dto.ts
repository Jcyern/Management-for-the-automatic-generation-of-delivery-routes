import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, ValidateIf, IsString, IsBoolean } from 'class-validator';
import { EstadoRuta } from '../../generated/prisma/client.js';

const ifDefined = (_object: unknown, value: unknown) => value !== undefined;

export class CreateRutaDto {
  @IsDateString()
  @IsNotEmpty()
  fechaRealizacion: string;

  @IsInt()
  @IsPositive()
  proporcionPedidosTipoEntrega: number;

  @IsInt()
  @IsPositive()
  cantidadTotalPedidos: number;

  @IsInt()
  @IsPositive()
  idLogistico: number;

  @IsInt()
  @IsPositive()
  idReporte: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  zonasIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  pedidosIds?: number[];
}

export class UpdateRutaDto {
  @ValidateIf(ifDefined)
  @IsDateString()
  fechaRealizacion?: string;

  @ValidateIf(ifDefined)
  @IsEnum(EstadoRuta)
  estado?: EstadoRuta;

  @ValidateIf(ifDefined)
  @IsInt()
  @IsPositive()
  proporcionPedidosTipoEntrega?: number;

  @ValidateIf(ifDefined)
  @IsInt()
  @IsPositive()
  cantidadTotalPedidos?: number;

  @ValidateIf(ifDefined)
  @IsInt()
  @IsPositive()
  idReporte?: number;

  @ValidateIf(ifDefined)
  @IsArray()
  @IsInt({ each: true })
  zonasIds?: number[];

  @ValidateIf(ifDefined)
  @IsArray()
  @IsInt({ each: true })
  pedidosIds?: number[];
}

export class AsignarRutaDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  idRepartidor: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;
}

export class ValidarRutaDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsNotEmpty()
  aprobadoRechazado: boolean;
}

export class IniciarRutaDto {
  @IsInt() 
  @IsPositive() 
  @IsNotEmpty()
  idVehiculo: number;
}