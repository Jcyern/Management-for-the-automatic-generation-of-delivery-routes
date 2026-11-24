import { Module } from '@nestjs/common';
import { FlotaController } from './adapters/inbound/http/FlotaController.js';
import { PrismaFlotaRepository } from './adapters/outbound/prisma/PrismaFlotaRepository.js';
import { FLOTA_REPOSITORY } from './application/ports/FlotaRepositoryPort.js';
import type { FlotaRepositoryPort } from './application/ports/FlotaRepositoryPort.js';
import { CrearFlotaUseCase } from './application/use-cases/CrearFlotaUseCase.js';
import { ActualizarFlotaUseCase } from './application/use-cases/ActualizarFlotaUseCase.js';
import { ObtenerFlotaUseCase } from './application/use-cases/ObtenerFlotaUseCase.js';
import { EliminarFlotaUseCase } from './application/use-cases/EliminarFlotaUseCase.js';
import { ListarFlotasUseCase } from './application/use-cases/ListarFlotasUseCase.js';
import { PrismaModule } from '../../prismaModule/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [FlotaController],
  providers: [
    { provide: FLOTA_REPOSITORY, useClass: PrismaFlotaRepository },
    {
      provide: CrearFlotaUseCase,
      useFactory: (repo: FlotaRepositoryPort) => new CrearFlotaUseCase(repo),
      inject: [FLOTA_REPOSITORY],
    },
    {
      provide: ActualizarFlotaUseCase,
      useFactory: (repo: FlotaRepositoryPort) => new ActualizarFlotaUseCase(repo),
      inject: [FLOTA_REPOSITORY],
    },
    {
      provide: ObtenerFlotaUseCase,
      useFactory: (repo: FlotaRepositoryPort) => new ObtenerFlotaUseCase(repo),
      inject: [FLOTA_REPOSITORY],
    },
    {
      provide: EliminarFlotaUseCase,
      useFactory: (repo: FlotaRepositoryPort) => new EliminarFlotaUseCase(repo),
      inject: [FLOTA_REPOSITORY],
    },
    {
      provide: ListarFlotasUseCase,
      useFactory: (repo: FlotaRepositoryPort) => new ListarFlotasUseCase(repo),
      inject: [FLOTA_REPOSITORY],
    },
  ],
})
export class FlotaHexModule {}