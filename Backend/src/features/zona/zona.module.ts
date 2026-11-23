import { Module } from '@nestjs/common';
import { ZonaController } from './adapters/inbound/http/ZonaController.js';
import { PrismaZonaRepository } from './adapters/outbound/prisma/PrismaZonaRepository.js';
import { ZONA_REPOSITORY } from './application/ports/ZonaRepositoryPort.js';
import type { ZonaRepositoryPort } from './application/ports/ZonaRepositoryPort.js';
import { CrearZonaUseCase } from './application/use-cases/CrearZonaUseCase.js';
import { ActualizarZonaUseCase } from './application/use-cases/ActualizarZonaUseCase.js';
import { ObtenerZonaUseCase } from './application/use-cases/ObtenerZonaUseCase.js';
import { EliminarZonaUseCase } from './application/use-cases/EliminarZonaUseCase.js';
import { ListarZonasUseCase } from './application/use-cases/ListarZonasUseCase.js';
import { PrismaModule } from '../../prismaModule/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ZonaController],
  providers: [
    { provide: ZONA_REPOSITORY, useClass: PrismaZonaRepository },
    {
      provide: CrearZonaUseCase,
      useFactory: (repo: ZonaRepositoryPort) => new CrearZonaUseCase(repo),
      inject: [ZONA_REPOSITORY],
    },
    {
      provide: ActualizarZonaUseCase,
      useFactory: (repo: ZonaRepositoryPort) => new ActualizarZonaUseCase(repo),
      inject: [ZONA_REPOSITORY],
    },
    {
      provide: ObtenerZonaUseCase,
      useFactory: (repo: ZonaRepositoryPort) => new ObtenerZonaUseCase(repo),
      inject: [ZONA_REPOSITORY],
    },
    {
      provide: EliminarZonaUseCase,
      useFactory: (repo: ZonaRepositoryPort) => new EliminarZonaUseCase(repo),
      inject: [ZONA_REPOSITORY],
    },
    {
      provide: ListarZonasUseCase,
      useFactory: (repo: ZonaRepositoryPort) => new ListarZonasUseCase(repo),
      inject: [ZONA_REPOSITORY],
    },
  ],
})
export class ZonaHexModule {}
