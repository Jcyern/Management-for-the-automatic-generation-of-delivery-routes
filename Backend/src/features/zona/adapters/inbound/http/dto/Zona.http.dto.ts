import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateZonaHttpDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

export class UpdateZonaHttpDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre?: string;
}
