import { describe, expect, it, vi } from 'vitest';
import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import { Centro } from '../../domain/Centro.js';
import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
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
  const query: CentroQueryPort = {
    buscarPorIdConZonas,
    listarPorCoordinador: vi.fn(),
    listarTodos: vi.fn(),
  };
  return { caso: new ObtenerCentroUseCase(query), buscarPorIdConZonas };
}

describe('ObtenerCentroUseCase', () => {
  it('devuelve el centro mapeado con sus zonas', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    const resultado = await d.caso.execute(3);

    expect(d.buscarPorIdConZonas).toHaveBeenCalledWith(3);
    expect(resultado.id).toBe(3);
    expect(resultado.nombre).toBe('Centro Sur');
    expect(resultado.zonas).toEqual([{ id: 20, nombre: 'Zona Sur' }]);
  });

  it('lanza 404 si el centro no existe', async () => {
    const d = crearDependencias();
    d.buscarPorIdConZonas.mockResolvedValue(null);

    await expect(d.caso.execute(99)).rejects.toBeInstanceOf(
      RecursoNoEncontrado,
    );
  });
});
