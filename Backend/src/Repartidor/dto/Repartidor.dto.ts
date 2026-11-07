import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';

const ifDefined = (_object: unknown, value: unknown) => value !== undefined;

export class CreateRepartidorDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  idUser: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  edad: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  idFlota: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  centrosIds?: number[];
}

export class UpdateRepartidorDto {
  @ValidateIf(ifDefined)
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ValidateIf(ifDefined)
  @IsInt()
  @IsPositive()
  edad?: number;

  @ValidateIf(ifDefined)
  @IsInt()
  @IsPositive()
  idFlota?: number;

  @ValidateIf(ifDefined)
  @IsArray()
  @IsInt({ each: true })
  centrosIds?: number[];
}