import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REDIS_CONFIG } from './redis.constants.js';
import { RedisService } from './redis.service.js';

const mocks = vi.hoisted(() => {
  const ping = vi.fn();
  const quit = vi.fn();
  const get = vi.fn();
  const set = vi.fn();
  const del = vi.fn();
  const hset = vi.fn();
  const hgetall = vi.fn();
  const expire = vi.fn();
  const mget = vi.fn();

  const Redis = vi.fn(function () {
    return {
      ping,
      quit,
      get,
      set,
      del,
      hset,
      hgetall,
      expire,
      mget,
      status: 'ready',
    };
  });

  return { ping, quit, get, set, del, hset, hgetall, expire, mget, Redis };
});

vi.mock('ioredis', () => ({ default: mocks.Redis, Redis: mocks.Redis }));

const config = { url: 'redis://localhost:6379' };

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService, { provide: REDIS_CONFIG, useValue: config }],
    }).compile();
    service = module.get(RedisService);
  });

  it('crea el cliente con la URL configurada', () => {
    expect(mocks.Redis).toHaveBeenCalledWith(config.url, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
  });

  it('hace ping al iniciar y quit al destruir', async () => {
    await service.onModuleInit();
    expect(mocks.ping).toHaveBeenCalledOnce();

    await service.onModuleDestroy();
    expect(mocks.quit).toHaveBeenCalledOnce();
  });

  it('serializa y deserializa JSON', async () => {
    mocks.set.mockResolvedValue('OK');
    mocks.get.mockResolvedValue('{"a":1}');

    await service.setJson('clave', { a: 1 }, 60);

    expect(mocks.set).toHaveBeenCalledWith('clave', '{"a":1}', 'EX', 60);
    await expect(service.getJson<{ a: number }>('clave')).resolves.toEqual({
      a: 1,
    });
  });
});
