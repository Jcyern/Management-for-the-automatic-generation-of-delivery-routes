import { describe, expect, it, vi } from 'vitest';
import { Centro } from '../../domain/Centro.js';
import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import { ListarCentrosUseCase } from './ListarCentrosUseCase.js';

function vistaCentro(id: number): CentroConZonas {
  return {
    centro: Centro.rehidratar({
      id,
      nombre: `Centro ${id}`,
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
  const listarPorCoordinador = vi.fn();
  const listarTodos = vi.fn();

  const query: CentroQueryPort = {
    buscarPorIdConZonas: vi.fn(),
    listarPorCoordinador,
    listarTodos,
  };

  return {
    caso: new ListarCentrosUseCase(query),
    listarPorCoordinador,
    listarTodos,
  };
}

describe('ListarCentrosUseCase', () => {
  it('filtra por coordinador cuando no es admin', async () => {
    const d = crearDependencias();
    d.listarPorCoordinador.mockResolvedValue([vistaCentro(1)]);

    const resultado = await d.caso.execute(5, false);

    expect(d.listarPorCoordinador).toHaveBeenCalledWith(5);
    expect(d.listarTodos).not.toHaveBeenCalled();
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.zonas).toEqual([{ id: 10, nombre: 'Zona Centro' }]);
  });

  it('lista todos los centros cuando es admin', async () => {
    const d = crearDependencias();
    d.listarTodos.mockResolvedValue([vistaCentro(1), vistaCentro(2)]);

    const resultado = await d.caso.execute(5, true);

    expect(d.listarTodos).toHaveBeenCalledTimes(1);
    expect(d.listarPorCoordinador).not.toHaveBeenCalled();
    expect(resultado).toHaveLength(2);
  });

  it('devuelve una lista vacía sin centros', async () => {
    const d = crearDependencias();
    d.listarPorCoordinador.mockResolvedValue([]);

    await expect(d.caso.execute(5, false)).resolves.toEqual([]);
  });
});
