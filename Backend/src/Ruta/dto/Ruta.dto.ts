import { ArrayNotEmpty, IsArray, IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';
import { EstadoRuta } from '../../generated/prisma/client.js';

const ifDefined = (_object: unknown, value: unknown) => value !== undefined;

/**
 * Datos para crear una ruta. La ruta se genera automáticamente a partir de los
 * pedidos indicados: el sistema infiere/valida el centro, calcula zonas
 * cubiertas y métricas, determina el orden de paradas y persiste la ruta con
 * sus paradas asociadas.
 */
export class CreateRutaDto {
  /** Pedidos a incluir en la ruta (deben pertenecer al mismo centro y no tener ruta asignada). */
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  pedidosIds: number[];

  /** Coordinador logístico responsable de la ruta. */
  @IsInt()
  @IsPositive()
  idLogistico: number;

  /** Fecha planificada de realización de la ruta. */
  @IsDateString()
  @IsNotEmpty()
  fechaRealizacion: string;

  /** Centro de distribución de origen; si se indica, debe coincidir con el de los pedidos. */
  @IsOptional()
  @IsInt()
  @IsPositive()
  idCentro?: number;

  /** Criterio de optimización para el orden de paradas (por defecto, distancia). */
  @IsOptional()
  @IsIn(['distancia', 'tiempo'])
  criterio?: 'distancia' | 'tiempo';

  /** Reporte a asociar a la ruta, si corresponde. */
  @IsOptional()
  @IsInt()
  @IsPositive()
  idReporte?: number;
}

/**
 * Datos para actualizar una ruta. Permite modificar pedidos, zonas y métricas;
 * estos cambios no recalculan automáticamente el orden ni las paradas, por lo
 * que pueden dejar la ruta en un estado inconsistente.
 */
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