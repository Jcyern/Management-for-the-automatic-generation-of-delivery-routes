import { Module } from '@nestjs/common';
import { VehiculoController } from './adapters/inbound/http/VehiculoController.js';
import { PrismaVehiculoRepository } from './adapters/outbound/prisma/PrismaVehiculoRepository.js';
import { VEHICULO_REPOSITORY } from './application/ports/VehiculoRepositoryPort.js';
import type { VehiculoRepositoryPort } from './application/ports/VehiculoRepositoryPort.js';
import { FLOTA_REPOSITORY } from '../flota/application/ports/FlotaRepositoryPort.js';
import type { FlotaRepositoryPort } from '../flota/application/ports/FlotaRepositoryPort.js';
import { PrismaFlotaRepository } from '../flota/adapters/outbound/prisma/PrismaFlotaRepository.js';
import { CrearVehiculoUseCase } from './application/use-cases/CrearVehiculoUseCase.js';
import { ActualizarVehiculoUseCase } from './application/use-cases/ActualizarVehiculoUseCase.js';
import { ObtenerVehiculoUseCase } from './application/use-cases/ObtenerVehiculoUseCase.js';
import { EliminarVehiculoUseCase } from './application/use-cases/EliminarVehiculoUseCase.js';
import { ListarVehiculosUseCase } from './application/use-cases/ListarVehiculosUseCase.js';
import { PrismaModule } from '../../prismaModule/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [VehiculoController],
  providers: [
    { provide: VEHICULO_REPOSITORY, useClass: PrismaVehiculoRepository },
    { provide: FLOTA_REPOSITORY, useClass: PrismaFlotaRepository },
    {
      provide: CrearVehiculoUseCase,
      useFactory: (vRepo: VehiculoRepositoryPort, fRepo: FlotaRepositoryPort) => new CrearVehiculoUseCase(vRepo, fRepo),
      inject: [VEHICULO_REPOSITORY, FLOTA_REPOSITORY],
    },
    {
      provide: ActualizarVehiculoUseCase,
      useFactory: (vRepo: VehiculoRepositoryPort, fRepo: FlotaRepositoryPort) => new ActualizarVehiculoUseCase(vRepo, fRepo),
      inject: [VEHICULO_REPOSITORY, FLOTA_REPOSITORY],
    },
    {
      provide: ObtenerVehiculoUseCase,
      useFactory: (repo: VehiculoRepositoryPort) => new ObtenerVehiculoUseCase(repo),
      inject: [VEHICULO_REPOSITORY],
    },
    {
      provide: EliminarVehiculoUseCase,
      useFactory: (repo: VehiculoRepositoryPort) => new EliminarVehiculoUseCase(repo),
      inject: [VEHICULO_REPOSITORY],
    },
    {
      provide: ListarVehiculosUseCase,
      useFactory: (repo: VehiculoRepositoryPort) => new ListarVehiculosUseCase(repo),
      inject: [VEHICULO_REPOSITORY],
    },
  ],
})
export class VehiculoHexModule {}