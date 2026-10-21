import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CrearParadaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  idPedido?: number;

  @IsOptional()
  @IsString()
  estadoEjecucion?: string;
}
