import { BadRequestException, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CRITERIOS, type CaminoResult, type Criterio } from './dto/camino.dto.js';
import { GrafoService } from './grafo.service.js';

@Controller('grafo')
export class GrafoController {
  constructor(private readonly grafoService: GrafoService) {}

  @Get('zonas/:origenId/camino-mas-corto')
  caminoMasCorto(
    @Param('origenId', ParseIntPipe) origenId: number,
    @Query('destinoId', ParseIntPipe) destinoId: number,
    @Query('criterio', new DefaultValuePipe('distancia')) criterio: string,
  ): Promise<CaminoResult> {
    return this.grafoService.caminoMasCorto(origenId, destinoId, this.parseCriterio(criterio));
  }

  @Get('zonas/:origenId/rutas-alternativas')
  rutasAlternativas(
    @Param('origenId', ParseIntPipe) origenId: number,
    @Query('destinoId', ParseIntPipe) destinoId: number,
    @Query('criterio', new DefaultValuePipe('distancia')) criterio: string,
    @Query('limite', new DefaultValuePipe(3), ParseIntPipe) limite: number,
  ): Promise<CaminoResult[]> {
    return this.grafoService.rutasAlternativas(origenId, destinoId, this.parseCriterio(criterio), limite);
  }

  private parseCriterio(valor: string): Criterio {
    if (!GrafoService.esCriterioValido(valor)) {
      throw new BadRequestException(`criterio invalido: '${valor}'. Valores: ${CRITERIOS.join(', ')}`);
    }
    return valor;
  }
}