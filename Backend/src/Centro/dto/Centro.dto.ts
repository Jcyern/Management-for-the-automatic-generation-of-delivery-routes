import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
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
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  zonasIds?: number[];
}
