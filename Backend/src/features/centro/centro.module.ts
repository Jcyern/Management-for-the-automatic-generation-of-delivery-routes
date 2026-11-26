import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prismaModule/prisma.module.js';
import { GeoModule } from '../../geo/geo.module.js';
import { CentroController } from './adapters/inbound/http/CentroController.js';
import { PrismaCentroRepository } from './adapters/outbound/prisma/PrismaCentroRepository.js';
import { GeocodificacionAdapter } from './adapters/outbound/geo/GeocodificacionAdapter.js';
import {
  CENTRO_REPOSITORY,
  type CentroRepositoryPort,
} from './application/ports/CentroRepositoryPort.js';
import {
  CENTRO_QUERY,
  type CentroQueryPort,
} from './application/ports/CentroQueryPort.js';
import { GEOCODIFICACION_PORT } from './application/ports/GeocodificacionPort.js';
import type { GeocodificacionPort } from './application/ports/GeocodificacionPort.js';
import { CrearCentroUseCase } from './application/use-cases/CrearCentroUseCase.js';
import { ListarCentrosUseCase } from './application/use-cases/ListarCentrosUseCase.js';
import { ObtenerCentroUseCase } from './application/use-cases/ObtenerCentroUseCase.js';
import { ActualizarCentroUseCase } from './application/use-cases/ActualizarCentroUseCase.js';
import { EliminarCentroUseCase } from './application/use-cases/EliminarCentroUseCase.js';

@Module({
  imports: [PrismaModule, GeoModule],
  controllers: [CentroController],
  providers: [
    PrismaCentroRepository,
    GeocodificacionAdapter,
    { provide: CENTRO_REPOSITORY, useExisting: PrismaCentroRepository },
    { provide: CENTRO_QUERY, useExisting: PrismaCentroRepository },
    { provide: GEOCODIFICACION_PORT, useExisting: GeocodificacionAdapter },
    {
      provide: CrearCentroUseCase,
      useFactory: (
        repo: CentroRepositoryPort,
        query: CentroQueryPort,
        geo: GeocodificacionPort,
      ) => new CrearCentroUseCase(repo, query, geo),
      inject: [CENTRO_REPOSITORY, CENTRO_QUERY, GEOCODIFICACION_PORT],
    },
    {
      provide: ListarCentrosUseCase,
      useFactory: (query: CentroQueryPort) => new ListarCentrosUseCase(query),
      inject: [CENTRO_QUERY],
    },
    {
      provide: ObtenerCentroUseCase,
      useFactory: (query: CentroQueryPort) => new ObtenerCentroUseCase(query),
      inject: [CENTRO_QUERY],
    },
    {
      provide: ActualizarCentroUseCase,
      useFactory: (
        repo: CentroRepositoryPort,
        query: CentroQueryPort,
        geo: GeocodificacionPort,
      ) => new ActualizarCentroUseCase(repo, query, geo),
      inject: [CENTRO_REPOSITORY, CENTRO_QUERY, GEOCODIFICACION_PORT],
    },
    {
      provide: EliminarCentroUseCase,
      useFactory: (repo: CentroRepositoryPort, query: CentroQueryPort) =>
        new EliminarCentroUseCase(repo, query),
      inject: [CENTRO_REPOSITORY, CENTRO_QUERY],
    },
  ],
})
export class CentroHexModule {}
