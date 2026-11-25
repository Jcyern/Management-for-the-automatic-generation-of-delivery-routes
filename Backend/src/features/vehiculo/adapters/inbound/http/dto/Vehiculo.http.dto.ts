import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateVehiculoHttpDto {
  @IsInt() @IsPositive() @IsNotEmpty()
  capacidad!: number;

  @IsInt() @IsPositive() @IsNotEmpty()
  idFlota!: number;
}

export class UpdateVehiculoHttpDto {
  @IsInt() @IsPositive() @IsOptional()
  capacidad?: number;

  @IsInt() @IsPositive() @IsOptional()
  idFlota?: number;
}