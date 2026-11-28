import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import type { TipoAsignacionCentro } from '../../../../application/ports/CentroRepositoryPort.js';

export class AsignarPorCorreoHttpDto {
  @IsEmail()
  correo: string;

  @IsIn(['crear', 'validar', 'repartidor'])
  tipo: TipoAsignacionCentro;

  @IsOptional()
  @IsInt()
  @IsPositive()
  centroId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  centroNombre?: string;
}
