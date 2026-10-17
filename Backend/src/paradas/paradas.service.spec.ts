import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { ParadasService } from './paradas.service.js';

const pedidoFindUnique = vi.fn();
const paradaCreate = vi.fn();

describe('ParadasService', () => {
  let service: ParadasService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParadasService,
        {
          provide: PrismaService,
          useValue: { pedido: { findUnique: pedidoFindUnique }, parada: { create: paradaCreate } },
        },
      ],
    }).compile();
    service = module.get(ParadasService);
  });

  it('crea la parada cuando el pedido existe', async () => {
    pedidoFindUnique.mockResolvedValue({ id: 7 });
    paradaCreate.mockResolvedValue({ id: 1, estadoEjecucion: 'PENDIENTE', idPedido: 7 });

    const resultado = await service.crear({ idPedido: 7 });

    expect(pedidoFindUnique).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(paradaCreate).toHaveBeenCalledWith({ data: { estadoEjecucion: 'PENDIENTE', idPedido: 7 } });
    expect(resultado).toEqual({ id: 1, estadoEjecucion: 'PENDIENTE', idPedido: 7 });
  });

  it('respeta el estadoEjecucion enviado (sin idPedido no consulta pedido)', async () => {
    paradaCreate.mockResolvedValue({});
    await service.crear({ estadoEjecucion: 'EN_CAMINO' });
    expect(pedidoFindUnique).not.toHaveBeenCalled();
    expect(paradaCreate).toHaveBeenCalledWith({ data: { estadoEjecucion: 'EN_CAMINO', idPedido: null } });
  });

  it('aplica el estado por defecto PENDIENTE', async () => {
    paradaCreate.mockResolvedValue({});
    await service.crear({});
    expect(paradaCreate.mock.calls[0][0].data.estadoEjecucion).toBe('PENDIENTE');
  });

  it('lanza NotFoundException si el pedido no existe', async () => {
    pedidoFindUnique.mockResolvedValue(null);
    await expect(service.crear({ idPedido: 99 })).rejects.toBeInstanceOf(NotFoundException);
    expect(paradaCreate).not.toHaveBeenCalled();
  });
});