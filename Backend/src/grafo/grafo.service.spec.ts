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

  it('devuelve el camino mas corto con distancia y tiempo', async () => {
    read.mockResolvedValue([
      {
        zonas: [1, 5, 2],
        distanciaKm: 11,
        tiempoMin: 27,
        costo: 11,
        saltos: 2,
      },
    ]);

    const resultado = await service.caminoMasCorto(1, 2, 'distancia');

    expect(resultado).toEqual({
      zonas: [1, 5, 2],
      distanciaKm: 11,
      tiempoMin: 27,
      costo: 11,
      saltos: 2,
    });
    expect(read).toHaveBeenCalledWith(
      expect.stringContaining('apoc.algo.dijkstra'),
      {
        origen: 1,
        destino: 2,
      },
    );
  });

  it('devuelve ambas metricas aunque el criterio sea tiempo', async () => {
    read.mockResolvedValue([
      {
        zonas: [1, 5, 2],
        distanciaKm: 11,
        tiempoMin: 27,
        costo: 27,
        saltos: 2,
      },
    ]);

    const resultado = await service.caminoMasCorto(1, 2, 'tiempo');

    expect(resultado.distanciaKm).toBe(11);
    expect(resultado.tiempoMin).toBe(27);
    expect(resultado.costo).toBe(27);
    expect(read.mock.calls[0]![0]).toContain("'tiempoMin'");
  });

  it('lanza NotFoundException si no hay camino', async () => {
    read.mockResolvedValue([]);

    await expect(
      service.caminoMasCorto(1, 99, 'distancia'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('devuelve alternativas con distancia y tiempo', async () => {
    read.mockResolvedValue([
      {
        zonas: [1, 5, 2],
        distanciaKm: 11,
        tiempoMin: 27,
        costo: 11,
        saltos: 2,
      },
      {
        zonas: [1, 5, 6, 2],
        distanciaKm: 13,
        tiempoMin: 32,
        costo: 13,
        saltos: 3,
      },
    ]);

    const resultado = await service.rutasAlternativas(1, 2, 'distancia', 3);

    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toEqual({
      zonas: [1, 5, 2],
      distanciaKm: 11,
      tiempoMin: 27,
      costo: 11,
      saltos: 2,
    });
  });

  it('lanza NotFoundException si no hay alternativas', async () => {
    read.mockResolvedValue([]);

    await expect(
      service.rutasAlternativas(1, 99, 'distancia', 3),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('limita el maximo de rutas alternativas a 10', async () => {
    read.mockResolvedValue([
      {
        zonas: [1, 5, 2],
        distanciaKm: 11,
        tiempoMin: 27,
        costo: 11,
        saltos: 2,
      },
    ]);

    await service.rutasAlternativas(1, 2, 'distancia', 99);

    expect(read.mock.calls[0]![0]).toContain('LIMIT 10');
  });

  it('valida los criterios permitidos', () => {
    expect(GrafoService.esCriterioValido('distancia')).toBe(true);
    expect(GrafoService.esCriterioValido('tiempo')).toBe(true);
    expect(GrafoService.esCriterioValido('foo')).toBe(false);
  });
});
