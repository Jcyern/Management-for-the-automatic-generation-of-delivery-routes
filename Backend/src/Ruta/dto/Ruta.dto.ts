import { ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';
import { EstadoRuta } from '../../generated/prisma/client.js';

const ifDefined = (_object: unknown, value: unknown) => value !== undefined;

export class CreateRutaDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  pedidosIds: number[];

  @IsInt()
  @IsPositive()
  idLogistico: number;

  @IsDateString()
  @IsNotEmpty()
  fechaRealizacion: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  idCentro?: number;

  @IsOptional()
  @IsIn(['distancia', 'tiempo'])
  criterio?: 'distancia' | 'tiempo';

  @IsOptional()
  @IsInt()
  @IsPositive()
  idReporte?: number;
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