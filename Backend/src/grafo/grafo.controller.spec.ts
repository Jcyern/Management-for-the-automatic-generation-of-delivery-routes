import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GrafoController } from './grafo.controller.js';
import { GrafoService } from './grafo.service.js';

const caminoMasCorto = vi.fn();
const rutasAlternativas = vi.fn();

describe('GrafoController', () => {
  let controller: GrafoController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrafoController],
      providers: [
        {
          provide: GrafoService,
          useValue: { caminoMasCorto, rutasAlternativas },
        },
      ],
    }).compile();
    controller = module.get(GrafoController);
  });

  it('delega el camino mas corto', async () => {
    caminoMasCorto.mockResolvedValue({
      zonas: [1],
      distanciaKm: 0,
      tiempoMin: 0,
      costo: 0,
      saltos: 0,
    });

    await controller.caminoMasCorto(1, 2, 'distancia');

    expect(caminoMasCorto).toHaveBeenCalledWith(1, 2, 'distancia');
  });

  it('delega las rutas alternativas', async () => {
    rutasAlternativas.mockResolvedValue([]);

    await controller.rutasAlternativas(1, 2, 'tiempo', 3);

    expect(rutasAlternativas).toHaveBeenCalledWith(1, 2, 'tiempo', 3);
  });

  it('rechaza un criterio invalido', () => {
    expect(() => controller.caminoMasCorto(1, 2, 'foo')).toThrow(
      BadRequestException,
    );
  });
});
