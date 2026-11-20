import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

const ifDefined = (_object: unknown, value: unknown) => value !== undefined;

export class CreateCentroDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  programaLogistico: string;

  @ValidateIf(ifDefined)
  @IsString()
  @IsNotEmpty()
  direccion?: string;

  @ValidateIf(ifDefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @ValidateIf(ifDefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @ValidateIf(ifDefined)
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  zonasIds?: number[];
}

export class UpdateCentroDto {
  @ValidateIf(ifDefined)
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ValidateIf(ifDefined)
  @IsString()
  @IsNotEmpty()
  programaLogistico?: string;

  @ValidateIf(ifDefined)
  @IsString()
  @IsNotEmpty()
  direccion?: string;

  @ValidateIf(ifDefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @ValidateIf(ifDefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @ValidateIf(ifDefined)
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  zonasIds?: number[];
}
