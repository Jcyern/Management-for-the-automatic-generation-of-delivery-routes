import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZonaController } from './Zona.controller.js';
import { ZonaService } from './Zona.service.js';
import { RolEfectivo } from '../Auth/roles.js';

const zonaService = vi.hoisted(() => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe('ZonaController - Autorización', () => {
  let controller: ZonaController;
  let reflector: Reflector;

  beforeEach(() => {
    vi.resetAllMocks();
    reflector = new Reflector();
    controller = new ZonaController(zonaService as unknown as ZonaService);
  });

  const getRoles = (method: Function) => {
    return reflector.get<RolEfectivo[]>('roles', method);
  };

  it('POST /zona debe requerir solo a ADMINISTRADOR', () => {
    const roles = getRoles(controller.create);
    expect(roles).toEqual([RolEfectivo.ADMINISTRADOR]);
  });

  it('PUT /zona/:id debe requerir solo a ADMINISTRADOR', () => {
    const roles = getRoles(controller.update);
    expect(roles).toEqual([RolEfectivo.ADMINISTRADOR]);
  });

  it('DELETE /zona/:id debe requerir solo a ADMINISTRADOR', () => {
    const roles = getRoles(controller.remove);
    expect(roles).toEqual([RolEfectivo.ADMINISTRADOR]);
  });

  it('GET /zona no debe requerir roles específicos (cualquier autenticado)', () => {
    const roles = getRoles(controller.findAll);
    expect(roles).toBeUndefined();
  });

  it('GET /zona/:id no debe requerir roles específicos (cualquier autenticado)', () => {
    const roles = getRoles(controller.findOne);
    expect(roles).toBeUndefined();
  });
});