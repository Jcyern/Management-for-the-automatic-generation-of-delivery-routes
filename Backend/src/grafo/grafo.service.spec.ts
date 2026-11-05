import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Neo4jService } from '../neo4j/neo4j.service.js';
import { GrafoService } from './grafo.service.js';

const read = vi.fn();

describe('GrafoService', () => {
  let service: GrafoService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrafoService, { provide: Neo4jService, useValue: { read } }],
    }).compile();
    service = module.get(GrafoService);
  });

  it('devuelve el camino mas corto', async () => {
    read.mockResolvedValue([{ zonas: [1, 5, 2], costo: 11, saltos: 2 }]);

    const resultado = await service.caminoMasCorto(1, 2, 'distancia');

    expect(resultado).toEqual({ zonas: [1, 5, 2], costo: 11, saltos: 2 });
    expect(read).toHaveBeenCalledWith(expect.stringContaining('apoc.algo.dijkstra'), {
      origen: 1,
      destino: 2,
    });
  });

  it('lanza NotFoundException si no hay camino', async () => {
    read.mockResolvedValue([]);

    await expect(service.caminoMasCorto(1, 99, 'distancia')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('usa el peso tiempoMin cuando el criterio es tiempo', async () => {
    read.mockResolvedValue([{ zonas: [1, 5, 2], costo: 27, saltos: 2 }]);

    await service.caminoMasCorto(1, 2, 'tiempo');

    expect(read.mock.calls[0][0]).toContain("'tiempoMin'");
  });

  it('limita el maximo de rutas alternativas a 10', async () => {
    read.mockResolvedValue([]);

    await service.rutasAlternativas(1, 2, 'distancia', 99);

    expect(read.mock.calls[0][0]).toContain('LIMIT 10');
  });

  it('valida los criterios permitidos', () => {
    expect(GrafoService.esCriterioValido('distancia')).toBe(true);
    expect(GrafoService.esCriterioValido('tiempo')).toBe(true);
    expect(GrafoService.esCriterioValido('foo')).toBe(false);
  });
});
