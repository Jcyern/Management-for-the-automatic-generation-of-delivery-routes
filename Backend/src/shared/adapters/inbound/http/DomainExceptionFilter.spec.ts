import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  Conflicto,
  DomainError,
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../domain/DomainError.js';
import { DomainExceptionFilter } from './DomainExceptionFilter.js';

function crearHost(url = '/zona/99') {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

class ErrorDesconocido extends DomainError {
  readonly codigo = 'DESCONOCIDO';
}

describe('DomainExceptionFilter', () => {
  const filtro = new DomainExceptionFilter();

  it('mapea RecursoNoEncontrado a 404 y conserva message', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new RecursoNoEncontrado('Zona', 99), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Zona 99 no encontrado',
        error: 'Not Found',
        codigo: 'NO_ENCONTRADO',
        mensaje: 'Zona 99 no encontrado',
        path: '/zona/99',
      }),
    );
  });

  it('mapea ReglaDeNegocioViolada a 400', () => {
    const { host, status, json } = crearHost('/zona/1');

    filtro.catch(
      new ReglaDeNegocioViolada('No se puede eliminar la zona.'),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'No se puede eliminar la zona.',
        error: 'Bad Request',
        codigo: 'REGLA_VIOLADA',
      }),
    );
  });

  it('mapea Conflicto a 409', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new Conflicto('La zona ya existe.'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'Conflict',
        codigo: 'CONFLICTO',
      }),
    );
  });

  it('mapea un DomainError desconocido a 500', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new ErrorDesconocido('boom'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Server Error',
        codigo: 'DESCONOCIDO',
      }),
    );
  });

  it('incluye timestamp ISO y path', () => {
    const { host, json } = crearHost('/zona/7');

    filtro.catch(new RecursoNoEncontrado('Zona', 7), host);

    const payload = json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(typeof payload.timestamp).toBe('string');
    expect(payload.path).toBe('/zona/7');
  });
});
