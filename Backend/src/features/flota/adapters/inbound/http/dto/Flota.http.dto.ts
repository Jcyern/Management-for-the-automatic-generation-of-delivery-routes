import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFlotaHttpDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

export class UpdateFlotaHttpDto {
  @IsString()
  @IsOptional()
  nombre?: string;
}