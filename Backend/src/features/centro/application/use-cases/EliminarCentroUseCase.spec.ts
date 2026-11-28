import { describe, expect, it, vi } from 'vitest';
import {
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import { Centro } from '../../domain/Centro.js';
import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import { EliminarCentroUseCase } from './EliminarCentroUseCase.js';

function vistaCentro(): CentroConZonas {
  return {
    centro: Centro.rehidratar({
      id: 1,
      nombre: 'Centro Norte',
      programaLogistico: 'Programa A',
      direccion: 'Calle 1',
      latitud: 23.1,
      longitud: -82.4,
      zonasIds: [10],
    }),
    zonas: [{ id: 10, nombre: 'Zona Centro' }],
  };
}

function crearDependencias() {
  const buscarPorIdConZonas = vi.fn();
  const tieneDependencias = vi.fn();
  const eliminar = vi.fn();

  const repo: CentroRepositoryPort = {
    crear: vi.fn(),
    actualizar: vi.fn(),
    buscarPorId: vi.fn(),
    existeNombre: vi.fn(),
    estaAutorizado: vi.fn(),
    tieneDependencias,
    eliminar,
    buscarPorNombre: vi.fn(),
    obtenerAsignaciones: vi.fn(),
    asignarPorCorreo: vi.fn(),
    desasignarPorCorreo: vi.fn(),
  };
  const query: CentroQueryPort = {
    buscarPorIdConZonas,
    listarPorCoordinador: vi.fn(),
    listarTodos: vi.fn(),
  };

  return {
    caso: new EliminarCentroUseCase(repo, query),
    buscarPorIdConZonas,
    tieneDependencias,
    eliminar,
  };
}

describe('EliminarCentroUseCase', () => {
  it('lanza 404 si el centro no existe', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(null);

    await expect(d.caso.execute(1)).rejects.toBeInstanceOf(
      RecursoNoEncontrado,
    );
  });

  it('lanza 400 si tiene pedidos o repartidores asociados', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());
    d.tieneDependencias.mockResolvedValue(true);

    await expect(d.caso.execute(1)).rejects.toBeInstanceOf(
      ReglaDeNegocioViolada,
    );
    expect(d.eliminar).not.toHaveBeenCalled();
  });

  it('elimina y devuelve la vista previa con zonas', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());
    d.tieneDependencias.mockResolvedValue(false);
    d.eliminar.mockResolvedValue(undefined);

    const resultado = await d.caso.execute(1);

    expect(d.eliminar).toHaveBeenCalledWith(1);
    expect(resultado.id).toBe(1);
    expect(resultado.zonas).toEqual([{ id: 10, nombre: 'Zona Centro' }]);
  });
});
