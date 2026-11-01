import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';
import { RolEfectivo } from './roles.js';

const reflector = {
  getAllAndOverride: vi.fn(),
};

function contextoConRol(rol?: RolEfectivo): ExecutionContext {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: rol ? { rol } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite si no hay roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextoConRol())).toBe(true);
  });

  it('permite si el rol coincide', () => {
    reflector.getAllAndOverride.mockReturnValue([
      RolEfectivo.ADMINISTRADOR,
    ]);

    expect(
      guard.canActivate(contextoConRol(RolEfectivo.ADMINISTRADOR)),
    ).toBe(true);
  });

  it('rechaza si el rol no coincide', () => {
    reflector.getAllAndOverride.mockReturnValue([
      RolEfectivo.ADMINISTRADOR,
    ]);

    expect(() =>
      guard.canActivate(contextoConRol(RolEfectivo.REPARTIDOR)),
    ).toThrow(ForbiddenException);
  });

  it('rechaza si no hay usuario autenticado', () => {
    reflector.getAllAndOverride.mockReturnValue([
      RolEfectivo.ADMINISTRADOR,
    ]);

    expect(() => guard.canActivate(contextoConRol())).toThrow(
      ForbiddenException,
    );
  });
});