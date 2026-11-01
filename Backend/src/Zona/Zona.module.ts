import { Module } from '@nestjs/common';
import { ZonaController } from './Zona.controller.js';
import { ZonaService } from './Zona.service.js';

@Module({
  controllers: [ZonaController],
  providers: [ZonaService],
})
export class ZonaModule {}