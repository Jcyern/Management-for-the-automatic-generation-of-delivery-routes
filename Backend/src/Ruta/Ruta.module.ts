import { Module } from '@nestjs/common';
import { GrafoModule } from '../grafo/grafo.module.js';
import { RutaController } from './Ruta.controller.js';
import { RutaService } from './Ruta.service.js';

@Module({
  imports: [GrafoModule],
  controllers: [RutaController],
  providers: [RutaService],
})
export class RutaModule {}