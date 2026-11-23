import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ESPECIALIDADES_COORDINADOR } from '../../../../domain/Coordinador.js';
import { RolEfectivo } from '../../../../../../Auth/roles.js';

const ROLES_COORDINADOR = [
  RolEfectivo.LOGISTICO,
  RolEfectivo.SUPERVISOR,
  RolEfectivo.ADMINISTRADOR,
] as const;

/**
 * DTO HTTP para crear un coordinador.
 * La creación se delega al caso de uso, que orquesta el alta a través del
 * puerto de registro.
 */
export class CreateCoordinadorHttpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsIn(ROLES_COORDINADOR)
  rol: RolEfectivo;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  centrosCrearIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  centrosValidarIds?: number[];
}

/**
 * DTO HTTP para actualizar un coordinador.
 * Todos los campos son opcionales: solo se modifica lo que se envía.
 */
export class UpdateCoordinadorHttpDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsIn(ESPECIALIDADES_COORDINADOR)
  especialidad?: (typeof ESPECIALIDADES_COORDINADOR)[number];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  centrosCrearIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  centrosValidarIds?: number[];
}
