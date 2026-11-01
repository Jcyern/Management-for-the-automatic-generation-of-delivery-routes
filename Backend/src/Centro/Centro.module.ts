import { Module } from '@nestjs/common';
import { CentroController } from './Centro.controller.js';
import { CentroService } from './Centro.service.js';

@Module({
  controllers: [CentroController],
  providers: [CentroService],
})
export class CentroModule {}
