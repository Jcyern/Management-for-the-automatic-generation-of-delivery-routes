import { Module } from '@nestjs/common';
import { AuthModule } from '../../Auth/Auth.module.js';
import { PrismaModule } from '../../prismaModule/prisma.module.js';
import { CoordinadorController } from './adapters/inbound/http/CoordinadorController.js';
import { AuthRegistroCoordinadorAdapter } from './adapters/outbound/auth/AuthRegistroCoordinadorAdapter.js';
import { PrismaCoordinadorRepository } from './adapters/outbound/prisma/PrismaCoordinadorRepository.js';
import {
  COORDINADOR_REPOSITORY,
  type CoordinadorRepositoryPort,
} from './application/ports/CoordinadorRepositoryPort.js';
import {
  REGISTRO_COORDINADOR_PORT,
  type RegistroCoordinadorPort,
} from './application/ports/RegistroCoordinadorPort.js';
import { ActualizarCoordinadorUseCase } from './application/use-cases/ActualizarCoordinadorUseCase.js';
import { CrearCoordinadorUseCase } from './application/use-cases/CrearCoordinadorUseCase.js';
import { EliminarCoordinadorUseCase } from './application/use-cases/EliminarCoordinadorUseCase.js';
import { ListarCoordinadoresUseCase } from './application/use-cases/ListarCoordinadoresUseCase.js';
import { ObtenerCoordinadorUseCase } from './application/use-cases/ObtenerCoordinadorUseCase.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CoordinadorController],
  providers: [
    { provide: COORDINADOR_REPOSITORY, useClass: PrismaCoordinadorRepository },
    {
      provide: REGISTRO_COORDINADOR_PORT,
      useClass: AuthRegistroCoordinadorAdapter,
    },
    {
      provide: CrearCoordinadorUseCase,
      useFactory: (registro: RegistroCoordinadorPort) =>
        new CrearCoordinadorUseCase(registro),
      inject: [REGISTRO_COORDINADOR_PORT],
    },
    {
      provide: ListarCoordinadoresUseCase,
      useFactory: (repo: CoordinadorRepositoryPort) =>
        new ListarCoordinadoresUseCase(repo),
      inject: [COORDINADOR_REPOSITORY],
    },
    {
      provide: ObtenerCoordinadorUseCase,
      useFactory: (repo: CoordinadorRepositoryPort) =>
        new ObtenerCoordinadorUseCase(repo),
      inject: [COORDINADOR_REPOSITORY],
    },
    {
      provide: ActualizarCoordinadorUseCase,
      useFactory: (repo: CoordinadorRepositoryPort) =>
        new ActualizarCoordinadorUseCase(repo),
      inject: [COORDINADOR_REPOSITORY],
    },
    {
      provide: EliminarCoordinadorUseCase,
      useFactory: (repo: CoordinadorRepositoryPort) =>
        new EliminarCoordinadorUseCase(repo),
      inject: [COORDINADOR_REPOSITORY],
    },
  ],
})
export class CoordinadorHexModule {}
