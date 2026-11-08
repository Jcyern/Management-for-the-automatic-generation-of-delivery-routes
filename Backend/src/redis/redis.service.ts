import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CONFIG, type RedisConfig } from './redis.constants.js';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(@Inject(REDIS_CONFIG) private readonly config: RedisConfig) {
    this.client = new Redis(config.url, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.ping();
    this.logger.log(`Conectado a Redis (${this.config.url})`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }

  async get(clave: string): Promise<string | null> {
    return this.client.get(clave);
  }

  async set(clave: string, valor: string): Promise<void> {
    await this.client.set(clave, valor);
  }

  async del(clave: string): Promise<void> {
    await this.client.del(clave);
  }

  async mget(claves: string[]): Promise<(string | null)[]> {
    return this.client.mget(claves);
  }

  async hset(clave: string, campo: string, valor: string): Promise<void> {
    await this.client.hset(clave, campo, valor);
  }

  async hgetall(clave: string): Promise<Record<string, string>> {
    return this.client.hgetall(clave);
  }

  async expire(clave: string, segundos: number): Promise<void> {
    await this.client.expire(clave, segundos);
  }

  async getJson<T>(clave: string): Promise<T | null> {
    const valor = await this.client.get(clave);
    return valor === null ? null : (JSON.parse(valor) as T);
  }

  async setJson<T>(
    clave: string,
    valor: T,
    ttlSegundos?: number,
  ): Promise<void> {
    const serializado = JSON.stringify(valor);
    if (ttlSegundos === undefined) {
      await this.client.set(clave, serializado);
      return;
    }
    await this.client.set(clave, serializado, 'EX', ttlSegundos);
  }
}
