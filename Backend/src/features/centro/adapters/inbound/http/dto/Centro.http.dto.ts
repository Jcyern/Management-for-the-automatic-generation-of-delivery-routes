import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCentroHttpDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  programaLogistico: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  direccion?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  zonasIds?: number[];
}

export class UpdateCentroHttpDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  programaLogistico?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  direccion?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  zonasIds?: number[];
}
