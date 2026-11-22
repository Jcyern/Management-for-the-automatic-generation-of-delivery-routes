import { Module } from '@nestjs/common';
import { TiempoRealService } from './tiempo-real.service.js';

@Module({
  providers: [TiempoRealService],
  exports: [TiempoRealService],
})
export class TiempoRealModule {}
