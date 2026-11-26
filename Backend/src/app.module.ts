import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Neo4jModule } from './neo4j/neo4j.module.js';
import { GrafoModule } from './grafo/grafo.module.js';
import { PrismaModule } from './prismaModule/prisma.module.js';
import { AuthModule } from './Auth/Auth.module.js';
import { PedidoHexModule } from './features/pedido/pedido.module.js';
import { CentroHexModule } from './features/centro/centro.module.js';
import { ZonaHexModule } from './features/zona/zona.module.js';
import { CoordinadorHexModule } from './features/coordinador/coordinador.module.js';
import { FlotaHexModule } from './features/flota/flota.module.js';
import { VehiculoHexModule } from './features/vehiculo/vehiculo.module.js';
import { RepartidorModule } from './Repartidor/Repartidor.module.js';
import { RutaModule } from './Ruta/Ruta.module.js';
import { RedisModule } from './redis/redis.module.js';
import { TiempoRealModule } from './tiempo-real/tiempo-real.module.js';
import { DomainExceptionFilter } from './shared/adapters/inbound/http/DomainExceptionFilter.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'management-for-the-automatic-generation-of-delivery-routes',
    }),
    Neo4jModule, GrafoModule, RedisModule, TiempoRealModule,
    PrismaModule, AuthModule, PedidoHexModule, CentroHexModule,
    ZonaHexModule, CoordinadorHexModule, FlotaHexModule, VehiculoHexModule,
    RepartidorModule, RutaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
