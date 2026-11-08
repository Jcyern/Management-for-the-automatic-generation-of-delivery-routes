import { Module } from '@nestjs/common';
import { VehiculoController } from './Vehiculo.controller.js';
import { VehiculoService } from './Vehiculo.service.js';

@Module({
  controllers: [VehiculoController],
  providers: [VehiculoService],
})
export class VehiculoModule {}