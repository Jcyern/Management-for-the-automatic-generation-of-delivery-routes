import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { RolEfectivo } from '../roles.js';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(RolEfectivo)
  rol: RolEfectivo;

  // --- Repartidor ---
  @ValidateIf((o: RegisterDto) => o.rol === RolEfectivo.REPARTIDOR)
  @IsInt()
  @IsPositive()
  edad?: number;

  @ValidateIf((o: RegisterDto) => o.rol === RolEfectivo.REPARTIDOR)
  @IsInt()
  @IsPositive()
  idFlota?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  centrosIds?: number[];

  // --- Coordinador / Supervisor / Administrador ---
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  centrosCrearIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  centrosValidarIds?: number[];
}