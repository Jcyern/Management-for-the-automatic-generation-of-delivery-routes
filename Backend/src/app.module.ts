import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Neo4jModule } from './neo4j/neo4j.module.js';
import { GrafoModule } from './grafo/grafo.module.js';
import { PrismaModule } from './prismaModule/prisma.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'management-for-the-automatic-generation-of-delivery-routes',
    }),
    Neo4jModule, GrafoModule, PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}