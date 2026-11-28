import { describe, expect, it, vi } from 'vitest';
import {
  AccesoDenegado,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';
import { Centro } from '../../domain/Centro.js';
import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import { ObtenerCentroUseCase } from './ObtenerCentroUseCase.js';

function vistaCentro(): CentroConZonas {
  return {
    centro: Centro.rehidratar({
      id: 3,
      nombre: 'Centro Sur',
      programaLogistico: 'Programa B',
      direccion: 'Calle 2',
      latitud: 22.5,
      longitud: -81.9,
      zonasIds: [20],
    }),
    zonas: [{ id: 20, nombre: 'Zona Sur' }],
  };
}

function crearDependencias() {
  const buscarPorIdConZonas = vi.fn();
  const estaAutorizado = vi.fn();

  const query: CentroQueryPort = {
    buscarPorIdConZonas,
    listarPorCoordinador: vi.fn(),
    listarTodos: vi.fn(),
  };
  const repo: CentroRepositoryPort = {
    crear: vi.fn(),
    actualizar: vi.fn(),
    buscarPorId: vi.fn(),
    existeNombre: vi.fn(),
    estaAutorizado,
    tieneDependencias: vi.fn(),
    eliminar: vi.fn(),
  };

  return {
    caso: new ObtenerCentroUseCase(query, repo),
    buscarPorIdConZonas,
    estaAutorizado,
  };
}

describe('ObtenerCentroUseCase', () => {
  it('devuelve el centro mapeado con sus zonas', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());
    d.estaAutorizado.mockResolvedValue(true);

    const resultado = await d.caso.execute(3, 5, false);

    expect(d.buscarPorIdConZonas).toHaveBeenCalledWith(3);
    expect(d.estaAutorizado).toHaveBeenCalledWith(3, 5);
    expect(resultado.id).toBe(3);
    expect(resultado.nombre).toBe('Centro Sur');
    expect(resultado.zonas).toEqual([{ id: 20, nombre: 'Zona Sur' }]);
  });

  it('permite al admin consultar cualquier centro sin comprobar asignación', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    const resultado = await d.caso.execute(3, 5, true);

    expect(d.estaAutorizado).not.toHaveBeenCalled();
    expect(resultado.id).toBe(3);
  });

  it('lanza 403 si un usuario no asignado consulta el centro', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());
    d.estaAutorizado.mockResolvedValue(false);

    await expect(d.caso.execute(3, 5, false)).rejects.toBeInstanceOf(
      AccesoDenegado,
    );
  });

  it('lanza 404 si el centro no existe', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(null);

    await expect(d.caso.execute(99, 5, false)).rejects.toBeInstanceOf(
      RecursoNoEncontrado,
    );
    expect(d.estaAutorizado).not.toHaveBeenCalled();
  });
});
