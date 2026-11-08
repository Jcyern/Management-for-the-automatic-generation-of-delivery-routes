import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RedisService } from '../redis/redis.service.js';
import { TiempoRealService } from './tiempo-real.service.js';

const redis = {
  get: vi.fn(),
  set: vi.fn(),
  mget: vi.fn(),
  hset: vi.fn(),
  hgetall: vi.fn(),
  expire: vi.fn(),
};

describe('TiempoRealService', () => {
  let service: TiempoRealService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiempoRealService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();
    service = module.get(TiempoRealService);
  });

  it('marca disponibilidad como 1 o 0', async () => {
    await service.marcarDisponibilidad(5, true);
    expect(redis.set).toHaveBeenCalledWith('repartidor:5:disponible', '1');

    await service.marcarDisponibilidad(5, false);
    expect(redis.set).toHaveBeenLastCalledWith('repartidor:5:disponible', '0');
  });

  it('lista solo los repartidores disponibles', async () => {
    redis.mget.mockResolvedValue(['1', '0', null]);

    await expect(service.listarDisponibles([1, 2, 3])).resolves.toEqual([1]);
    expect(redis.mget).toHaveBeenCalledWith([
      'repartidor:1:disponible',
      'repartidor:2:disponible',
      'repartidor:3:disponible',
    ]);
  });

  it('actualiza una parada y renueva el TTL de la ruta', async () => {
    await service.actualizarEstadoParada(1, 2, 'Visitada');

    expect(redis.hset).toHaveBeenCalledWith('ruta:1:paradas', '2', 'Visitada');
    expect(redis.expire).toHaveBeenCalledWith('ruta:1:paradas', 86400);
  });

  it('devuelve el estado de todas las paradas', async () => {
    redis.hgetall.mockResolvedValue({ '1': 'Visitada', '2': 'Pendiente' });

    await expect(service.obtenerEstadoParadas(1)).resolves.toEqual({
      '1': 'Visitada',
      '2': 'Pendiente',
    });
  });
});
