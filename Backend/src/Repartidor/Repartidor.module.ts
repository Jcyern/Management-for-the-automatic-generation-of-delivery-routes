import { Module } from '@nestjs/common';
import { RepartidorController } from './Repartidor.controller.js';
import { RepartidorService } from './Repartidor.service.js';

@Module({
  controllers: [RepartidorController],
  providers: [RepartidorService],
})
export class RepartidorModule {}