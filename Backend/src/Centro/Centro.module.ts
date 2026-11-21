import { Module } from '@nestjs/common';
import { GeoModule } from '../geo/geo.module.js';
import { CentroController } from './Centro.controller.js';
import { CentroService } from './Centro.service.js';

@Module({
  imports: [GeoModule],
  controllers: [CentroController],
  providers: [CentroService],
})
export class CentroModule {}
