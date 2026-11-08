import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateZonaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

export class UpdateZonaDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre?: string;
}