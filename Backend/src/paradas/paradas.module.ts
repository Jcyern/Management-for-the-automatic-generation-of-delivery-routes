import { Module } from '@nestjs/common';
import { ParadasController } from './paradas.controller.js';
import { ParadasService } from './paradas.service.js';

@Module({
  controllers: [ParadasController],
  providers: [ParadasService],
})
export class ParadasModule {}