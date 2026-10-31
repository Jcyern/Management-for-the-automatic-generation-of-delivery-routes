import { Module } from '@nestjs/common';
import { GrafoController } from './grafo.controller.js';
import { GrafoService } from './grafo.service.js';

@Module({
  controllers: [GrafoController],
  providers: [GrafoService],
  exports: [GrafoService],
})
export class GrafoModule {}