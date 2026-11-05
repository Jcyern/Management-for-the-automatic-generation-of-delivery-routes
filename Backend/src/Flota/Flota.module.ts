import { Module } from '@nestjs/common';
import { FlotaController } from './Flota.controller.js';
import { FlotaService } from './Flota.service.js';

@Module({
  controllers: [FlotaController],
  providers: [FlotaService],
})
export class FlotaModule {}