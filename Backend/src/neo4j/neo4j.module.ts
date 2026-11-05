import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NEO4J_CONFIG, type Neo4jConfig } from './neo4j.constants.js';
import { Neo4jService } from './neo4j.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: NEO4J_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Neo4jConfig => ({
        uri: config.getOrThrow<string>('NEO4J_URI'),
        username: config.getOrThrow<string>('NEO4J_USER'),
        password: config.getOrThrow<string>('NEO4J_PASSWORD'),
        database: config.get<string>('NEO4J_DATABASE') ?? 'neo4j',
      }),
    },
    Neo4jService,
  ],
  exports: [Neo4jService],
})
export class Neo4jModule {}