import { Module } from '@nestjs/common';
import { RutaController } from './Ruta.controller.js';
import { RutaService } from './Ruta.service.js';

@Module({
  controllers: [RutaController],
  providers: [RutaService],
})
export class RutaModule {}