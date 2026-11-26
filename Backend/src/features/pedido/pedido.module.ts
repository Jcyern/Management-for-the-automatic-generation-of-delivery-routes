import { Module } from '@nestjs/common';
import { GeoModule } from '../../geo/geo.module.js';
import { PrismaModule } from '../../prismaModule/prisma.module.js';
import { PedidoController } from './adapters/inbound/http/PedidoController.js';
import { GeocodingServiceAdapter } from './adapters/outbound/geo/GeocodingServiceAdapter.js';
import { PrismaPedidoRepository } from './adapters/outbound/prisma/PrismaPedidoRepository.js';
import {
  PEDIDO_REPOSITORY,
  type PedidoRepositoryPort,
} from './application/ports/PedidoRepositoryPort.js';
import {
  GEOCODIFICACION_PEDIDO_PORT,
  type GeocodificacionPort,
} from './application/ports/GeocodificacionPort.js';
import { ActualizarPedidoUseCase } from './application/use-cases/ActualizarPedidoUseCase.js';
import { CrearPedidoUseCase } from './application/use-cases/CrearPedidoUseCase.js';
import { EliminarPedidoUseCase } from './application/use-cases/EliminarPedidoUseCase.js';
import { ListarPedidosUseCase } from './application/use-cases/ListarPedidosUseCase.js';
import { ObtenerPedidoUseCase } from './application/use-cases/ObtenerPedidoUseCase.js';

@Module({
  imports: [PrismaModule, GeoModule],
  controllers: [PedidoController],
  providers: [
    { provide: PEDIDO_REPOSITORY, useClass: PrismaPedidoRepository },
    {
      provide: GEOCODIFICACION_PEDIDO_PORT,
      useClass: GeocodingServiceAdapter,
    },
    {
      provide: CrearPedidoUseCase,
      useFactory: (
        repo: PedidoRepositoryPort,
        geocodificacion: GeocodificacionPort,
      ) => new CrearPedidoUseCase(repo, geocodificacion),
      inject: [PEDIDO_REPOSITORY, GEOCODIFICACION_PEDIDO_PORT],
    },
    {
      provide: ListarPedidosUseCase,
      useFactory: (repo: PedidoRepositoryPort) => new ListarPedidosUseCase(repo),
      inject: [PEDIDO_REPOSITORY],
    },
    {
      provide: ObtenerPedidoUseCase,
      useFactory: (repo: PedidoRepositoryPort) => new ObtenerPedidoUseCase(repo),
      inject: [PEDIDO_REPOSITORY],
    },
    {
      provide: ActualizarPedidoUseCase,
      useFactory: (
        repo: PedidoRepositoryPort,
        geocodificacion: GeocodificacionPort,
      ) => new ActualizarPedidoUseCase(repo, geocodificacion),
      inject: [PEDIDO_REPOSITORY, GEOCODIFICACION_PEDIDO_PORT],
    },
    {
      provide: EliminarPedidoUseCase,
      useFactory: (repo: PedidoRepositoryPort) => new EliminarPedidoUseCase(repo),
      inject: [PEDIDO_REPOSITORY],
    },
  ],
})
export class PedidoHexModule {}
