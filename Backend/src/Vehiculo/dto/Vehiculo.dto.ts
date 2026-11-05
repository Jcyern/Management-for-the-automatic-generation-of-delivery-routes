import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateVehiculoDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  capacidad: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  flotaID: number;
}

export class UpdateVehiculoDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  capacidad?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  flotaID?: number;
}