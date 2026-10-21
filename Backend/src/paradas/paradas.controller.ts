import { Body, Controller, Post } from '@nestjs/common';
import { CrearParadaDto } from './dto/crear-parada.dto.js';
import { ParadasService } from './paradas.service.js';

@Controller('paradas')
export class ParadasController {
  constructor(private readonly paradasService: ParadasService) {}

  @Post()
  crear(@Body() dto: CrearParadaDto) {
    return this.paradasService.crear(dto);
  }
}
