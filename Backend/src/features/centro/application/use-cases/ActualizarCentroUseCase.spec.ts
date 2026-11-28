import { describe, expect, it, vi } from 'vitest';
import {
  Conflicto,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';
import { Centro } from '../../domain/Centro.js';
import type { CentroConZonas } from '../models/CentroConZonas.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import { ActualizarCentroUseCase } from './ActualizarCentroUseCase.js';

function centroActual(): Centro {
  return Centro.rehidratar({
    id: 1,
    nombre: 'Centro Norte',
    programaLogistico: 'Programa A',
    direccion: 'Calle 1',
    latitud: 23.1,
    longitud: -82.4,
    zonasIds: [10],
  });
}

function vistaCentro(): CentroConZonas {
  return {
    centro: centroActual(),
    zonas: [{ id: 10, nombre: 'Zona Centro' }],
  };
}

interface Opciones {
  resultadoGeo?: { latitud: number; longitud: number } | null;
}

function crearDependencias({
  resultadoGeo = { latitud: 10, longitud: 20 },
}: Opciones = {}) {
  const buscarPorId = vi.fn();
  const existeNombre = vi.fn();
  const actualizar = vi.fn();
  const buscarPorIdConZonas = vi.fn();
  const geocodificar = vi.fn().mockResolvedValue(resultadoGeo);

  const repo: CentroRepositoryPort = {
    crear: vi.fn(),
    actualizar,
    buscarPorId,
    existeNombre,
    estaAutorizado: vi.fn(),
    tieneDependencias: vi.fn(),
    eliminar: vi.fn(),
  };
  const query: CentroQueryPort = {
    buscarPorIdConZonas,
    listarPorCoordinador: vi.fn(),
    listarTodos: vi.fn(),
  };
  const geo: GeocodificacionPort = { geocodificar, modoEstricto: false };

  return {
    caso: new ActualizarCentroUseCase(repo, query, geo),
    buscarPorId,
    existeNombre,
    actualizar,
    buscarPorIdConZonas,
    geocodificar,
  };
}

describe('ActualizarCentroUseCase', () => {
  it('lanza 404 si el centro no existe', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(null);

    await expect(d.caso.execute(1, { nombre: 'X' })).rejects.toBeInstanceOf(
      RecursoNoEncontrado,
    );
  });

  it('lanza 409 si el nuevo nombre ya existe', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(centroActual());
    d.existeNombre.mockResolvedValue(true);

    await expect(
      d.caso.execute(1, { nombre: 'Otro centro' }),
    ).rejects.toBeInstanceOf(Conflicto);
    expect(d.actualizar).not.toHaveBeenCalled();
    expect(d.geocodificar).not.toHaveBeenCalled();
  });

  it('renombra y cambia el programa', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(centroActual());
    d.existeNombre.mockResolvedValue(false);
    d.actualizar.mockResolvedValue(centroActual());
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    await d.caso.execute(1, {
      nombre: '  Centro Sur  ',
      programaLogistico: 'Programa B',
    });

    const entidad = d.actualizar.mock.calls[0]?.[0] as Centro;
    expect(entidad.nombre).toBe('Centro Sur');
    expect(entidad.programaLogistico).toBe('Programa B');
    expect(d.existeNombre).toHaveBeenCalledWith('Centro Sur', 1);
  });

  it('con solo coordenadas conserva la dirección actual', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(centroActual());
    d.actualizar.mockResolvedValue(centroActual());
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    await d.caso.execute(1, { latitud: 10, longitud: 20 });

    const entidad = d.actualizar.mock.calls[0]?.[0] as Centro;
    expect(entidad.direccion).toBe('Calle 1');
    expect(entidad.latitud).toBe(10);
    expect(entidad.longitud).toBe(20);
    expect(d.geocodificar).not.toHaveBeenCalled();
  });

  it('geocodifica cuando solo se envía una dirección', async () => {
    const d = crearDependencias({
      resultadoGeo: { latitud: 11, longitud: 21 },
    });
    d.buscarPorId.mockResolvedValue(centroActual());
    d.actualizar.mockResolvedValue(centroActual());
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    await d.caso.execute(1, { direccion: 'Calle Nueva' });

    const entidad = d.actualizar.mock.calls[0]?.[0] as Centro;
    expect(entidad.direccion).toBe('Calle Nueva');
    expect(entidad.latitud).toBe(11);
    expect(entidad.longitud).toBe(21);
    expect(d.geocodificar).toHaveBeenCalledWith('Calle Nueva');
  });

  it('reemplaza las zonas cuando se envían zonasIds', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(centroActual());
    d.actualizar.mockResolvedValue(centroActual());
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    await d.caso.execute(1, { zonasIds: [20, 21] });

    const entidad = d.actualizar.mock.calls[0]?.[0] as Centro;
    expect(entidad.zonasIds).toEqual([20, 21]);
  });

  it('no toca ubicación ni zonas si no se envían', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(centroActual());
    d.actualizar.mockResolvedValue(centroActual());
    d.buscarPorIdConZonas.mockResolvedValue(vistaCentro());

    await d.caso.execute(1, {});

    const entidad = d.actualizar.mock.calls[0]?.[0] as Centro;
    expect(entidad.direccion).toBe('Calle 1');
    expect(entidad.latitud).toBe(23.1);
    expect(entidad.zonasIds).toEqual([10]);
    expect(d.geocodificar).not.toHaveBeenCalled();
  });

  it('devuelve 404 defensivo si no puede releer tras actualizar', async () => {
    const d = crearDependencias();
    d.buscarPorId.mockResolvedValue(centroActual());
    d.actualizar.mockResolvedValue(centroActual());
    d.buscarPorIdConZonas.mockResolvedValue(null);

    await expect(d.caso.execute(1, {})).rejects.toBeInstanceOf(
      RecursoNoEncontrado,
    );
  });
});
