import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFlotaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

export class UpdateFlotaDto {
  @IsString()
  @IsOptional()
  nombre?: string;
}