import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ParadasController } from './paradas.controller.js';
import { ParadasService } from './paradas.service.js';

const crear = vi.fn();

describe('ParadasController', () => {
  let controller: ParadasController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParadasController],
      providers: [{ provide: ParadasService, useValue: { crear } }],
    }).compile();
    controller = module.get(ParadasController);
  });

  it('delega en el servicio', async () => {
    const dto = { idPedido: 7 };
    crear.mockResolvedValue({ id: 1 });
    const resultado = await controller.crear(dto);
    expect(crear).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual({ id: 1 });
  });
});