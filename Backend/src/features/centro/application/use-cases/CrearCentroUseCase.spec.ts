import { describe, expect, it, vi } from 'vitest';
import {
  Conflicto,
  EntidadNoProcesable,
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import { Centro } from '../../domain/Centro.js';
import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import { CrearCentroUseCase } from './CrearCentroUseCase.js';

interface Opciones {
  modoEstricto?: boolean;
  resultadoGeo?: { latitud: number; longitud: number } | null;
}

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

function crearDependencias({
  modoEstricto = false,
  resultadoGeo = { latitud: 23.1, longitud: -82.4 },
}: Opciones = {}) {
  const crear = vi.fn();
  const existeNombre = vi.fn();
  const buscarPorIdConZonas = vi.fn();
  const geocodificar = vi.fn().mockResolvedValue(resultadoGeo);

  const repo: CentroRepositoryPort = {
    crear,
    actualizar: vi.fn(),
    buscarPorId: vi.fn(),
    existeNombre,
    estaAutorizado: vi.fn(),
    tieneDependencias: vi.fn(),
    eliminar: vi.fn(),
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
  const geo: GeocodificacionPort = { geocodificar, modoEstricto };

  return {
    caso: new CrearCentroUseCase(repo, query, geo),
    crear,
    existeNombre,
    buscarPorIdConZonas,
    geocodificar,
  };
}

describe('CrearCentroUseCase', () => {
  it('crea el centro, lo asocia al creador y devuelve las zonas', async () => {
    const d = crearDependencias();
    d.existeNombre.mockResolvedValue(false);
    d.crear.mockResolvedValue(
      Centro.rehidratar({
        id: 7,
        nombre: 'Centro Norte',
        programaLogistico: 'Programa A',
        direccion: 'Calle 1',
        latitud: 23.1,
        longitud: -82.4,
        zonasIds: [10, 11],
      }),
    );
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    const resultado = await d.caso.execute(
      {
        nombre: '  Centro Norte  ',
        programaLogistico: 'Programa A',
        direccion: 'Calle 1',
        zonasIds: [10, 11],
      },
      99,
    );

    const entidad = d.crear.mock.calls[0]?.[0] as Centro;
    expect(entidad.nombre).toBe('Centro Norte');
    expect(entidad.zonasIds).toEqual([10, 11]);
    expect(d.crear.mock.calls[0]?.[1]).toBe(99);
    expect(d.buscarPorIdConZonas).toHaveBeenCalledWith(7);
    expect(resultado.zonas).toEqual([{ id: 10, nombre: 'Zona Centro' }]);
  });

  it('rechaza con conflicto si el nombre ya existe y no geocodifica', async () => {
    const d = crearDependencias();
    d.existeNombre.mockResolvedValue(true);

    await expect(
      d.caso.execute(
        { nombre: 'Centro Norte', programaLogistico: 'Programa A' },
        1,
      ),
    ).rejects.toBeInstanceOf(Conflicto);

    expect(d.geocodificar).not.toHaveBeenCalled();
    expect(d.crear).not.toHaveBeenCalled();
  });

  it('exige una ubicación al crear', async () => {
    const d = crearDependencias();
    d.existeNombre.mockResolvedValue(false);

    await expect(
      d.caso.execute(
        { nombre: 'Centro Norte', programaLogistico: 'Programa A' },
        1,
      ),
    ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
  });

  it('devuelve 422 si el geocoding estricto no resuelve la dirección', async () => {
    const d = crearDependencias({ modoEstricto: true, resultadoGeo: null });
    d.existeNombre.mockResolvedValue(false);

    await expect(
      d.caso.execute(
        {
          nombre: 'Centro Norte',
          programaLogistico: 'Programa A',
          direccion: 'Dirección inexistente',
        },
        1,
      ),
    ).rejects.toBeInstanceOf(EntidadNoProcesable);

    expect(d.crear).not.toHaveBeenCalled();
  });

  it('en modo tolerante crea con coordenadas nulas', async () => {
    const d = crearDependencias({ modoEstricto: false, resultadoGeo: null });
    d.existeNombre.mockResolvedValue(false);
    d.crear.mockResolvedValue(
      Centro.rehidratar({
        id: 7,
        nombre: 'Centro Norte',
        programaLogistico: 'Programa A',
        direccion: 'Dirección rara',
        latitud: null,
        longitud: null,
        zonasIds: [],
      }),
    );
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    await d.caso.execute(
      {
        nombre: 'Centro Norte',
        programaLogistico: 'Programa A',
        direccion: 'Dirección rara',
      },
      1,
    );

    const entidad = d.crear.mock.calls[0]?.[0] as Centro;
    expect(entidad.direccion).toBe('Dirección rara');
    expect(entidad.latitud).toBeNull();
    expect(entidad.longitud).toBeNull();
  });

  it('falla si el repositorio devuelve una entidad sin id', async () => {
    const d = crearDependencias();
    d.existeNombre.mockResolvedValue(false);
    d.crear.mockResolvedValue(
      Centro.crear({
        nombre: 'Centro Norte',
        programaLogistico: 'Programa A',
        direccion: 'Calle 1',
      }),
    );

    await expect(
      d.caso.execute(
        {
          nombre: 'Centro Norte',
          programaLogistico: 'Programa A',
          direccion: 'Calle 1',
        },
        1,
      ),
    ).rejects.toThrow('El centro creado no tiene id persistido.');
  });

  it('devuelve 404 defensivo si no puede releer el centro creado', async () => {
    const d = crearDependencias();
    d.existeNombre.mockResolvedValue(false);
    d.crear.mockResolvedValue(
      Centro.rehidratar({
        id: 7,
        nombre: 'Centro Norte',
        programaLogistico: 'Programa A',
        direccion: 'Calle 1',
        latitud: 23.1,
        longitud: -82.4,
        zonasIds: [],
      }),
    );
    d.buscarPorIdConZonas.mockResolvedValue(null);

    await expect(
      d.caso.execute(
        {
          nombre: 'Centro Norte',
          programaLogistico: 'Programa A',
          direccion: 'Calle 1',
        },
        1,
      ),
    ).rejects.toBeInstanceOf(RecursoNoEncontrado);
  });
});
