import { Module } from '@nestjs/common';
import { RepartidorController } from './adapters/inbound/http/RepartidorController.js';
import { PrismaRepartidorRepository } from './adapters/outbound/prisma/PrismaRepartidorRepository.js';
import { ExternalAdapter } from './adapters/outbound/redis/RedisExternalAdapter.js';
import { REPARTIDOR_REPOSITORY } from './application/ports/RepartidorRepositoryPort.js';
import { USUARIO_CHECKER, TIEMPO_REAL_PORT } from './application/ports/ExternalPorts.js';
import { FLOTA_REPOSITORY } from '../flota/application/ports/FlotaRepositoryPort.js';
import { PrismaFlotaRepository } from '../flota/adapters/outbound/prisma/PrismaFlotaRepository.js';
import { CrearRepartidorUseCase } from './application/use-cases/CrearRepartidorUseCase.js';
import { ActualizarRepartidorUseCase } from './application/use-cases/ActualizarRepartidorUseCase.js';
import { ObtenerRepartidorUseCase } from './application/use-cases/ObtenerRepartidorUseCase.js';
import { EliminarRepartidorUseCase } from './application/use-cases/EliminarRepartidorUseCase.js';
import { ListarRepartidoresUseCase } from './application/use-cases/ListarRepartidoresUseCase.js';
import { VerificarDisponibilidadUseCase } from './application/use-cases/VerificarDisponibilidadUseCase.js';
import { PrismaModule } from '../../prismaModule/prisma.module.js';
import { TiempoRealModule } from '../../tiempo-real/tiempo-real.module.js';

@Module({
  imports: [PrismaModule, TiempoRealModule],
  controllers: [RepartidorController],
  providers: [
    { provide: REPARTIDOR_REPOSITORY, useClass: PrismaRepartidorRepository },
    { provide: FLOTA_REPOSITORY, useClass: PrismaFlotaRepository },
    { provide: USUARIO_CHECKER, useClass: ExternalAdapter },
    { provide: TIEMPO_REAL_PORT, useClass: ExternalAdapter },
    
    {
      provide: CrearRepartidorUseCase,
      useFactory: (repo, flota, user) => new CrearRepartidorUseCase(repo, flota, user),
      inject: [REPARTIDOR_REPOSITORY, FLOTA_REPOSITORY, USUARIO_CHECKER],
    },
    {
      provide: ActualizarRepartidorUseCase,
      useFactory: (repo, flota) => new ActualizarRepartidorUseCase(repo, flota),
      inject: [REPARTIDOR_REPOSITORY, FLOTA_REPOSITORY],
    },
    {
      provide: ObtenerRepartidorUseCase,
      useFactory: (repo) => new ObtenerRepartidorUseCase(repo),
      inject: [REPARTIDOR_REPOSITORY],
    },
    {
      provide: EliminarRepartidorUseCase,
      useFactory: (repo) => new EliminarRepartidorUseCase(repo),
      inject: [REPARTIDOR_REPOSITORY],
    },
    {
      provide: ListarRepartidoresUseCase,
      useFactory: (repo) => new ListarRepartidoresUseCase(repo),
      inject: [REPARTIDOR_REPOSITORY],
    },
    {
      provide: VerificarDisponibilidadUseCase,
      useFactory: (tiempoReal) => new VerificarDisponibilidadUseCase(tiempoReal),
      inject: [TIEMPO_REAL_PORT],
    },
  ],
})
export class RepartidorHexModule {}