import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import neo4j, { type Driver, type Session } from 'neo4j-driver';
import { NEO4J_CONFIG, type Neo4jConfig } from './neo4j.constants.js';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private readonly driver: Driver;

  constructor(@Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig) {
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
    );
  }

  async onModuleInit(): Promise<void> {
    await this.driver.verifyConnectivity();
    this.logger.log(`Conectado a Neo4j (${this.config.uri}, db: ${this.config.database})`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.driver.close();
  }

  async read<T>(cypher: string, params: Record<string, unknown> = {}): Promise<T[]> {
    const session: Session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.executeRead((tx) => tx.run(cypher, params));
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async write<T>(cypher: string, params: Record<string, unknown> = {}): Promise<T[]> {
    const session: Session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.executeWrite((tx) => tx.run(cypher, params));
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }
}