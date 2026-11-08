import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CONFIG, type RedisConfig } from './redis.constants.js';
import { RedisService } from './redis.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): RedisConfig => ({
        url: config.getOrThrow<string>('REDIS_URL'),
      }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
