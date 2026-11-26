import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateRepartidorHttpDto {
  @IsInt() @IsPositive() @IsNotEmpty()
  idUser!: number;

  @IsString() @IsNotEmpty()
  nombre!: string;

  @IsInt() @Min(18)
  edad!: number;

  @IsInt() @IsPositive() @IsNotEmpty()
  idFlota!: number;

  @IsArray() @IsInt({ each: true }) @IsOptional()
  centrosIds?: number[];
}

export class UpdateRepartidorHttpDto {
  @IsString() @IsOptional()
  nombre?: string;

  @IsInt() @Min(18) @IsOptional()
  edad?: number;

  @IsInt() @IsPositive() @IsOptional()
  idFlota?: number;

  @IsArray() @IsInt({ each: true }) @IsOptional()
  centrosIds?: number[];
}