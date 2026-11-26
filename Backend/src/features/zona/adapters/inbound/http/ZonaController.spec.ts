import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLES_KEY, RolEfectivo } from '../../../../../Auth/roles.js';
import type { ActualizarZonaUseCase } from '../../../application/use-cases/ActualizarZonaUseCase.js';
import type { CrearZonaUseCase } from '../../../application/use-cases/CrearZonaUseCase.js';
import type { EliminarZonaUseCase } from '../../../application/use-cases/EliminarZonaUseCase.js';
import type { ListarZonasUseCase } from '../../../application/use-cases/ListarZonasUseCase.js';
import type { ObtenerZonaUseCase } from '../../../application/use-cases/ObtenerZonaUseCase.js';
import { ZonaController } from './ZonaController.js';

const crear = { execute: vi.fn() };
const actualizar = { execute: vi.fn() };
const obtener = { execute: vi.fn() };
const eliminar = { execute: vi.fn() };
const listar = { execute: vi.fn() };

describe('ZonaController', () => {
  let controller: ZonaController;
  const reflector = new Reflector();

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new ZonaController(
      crear as unknown as CrearZonaUseCase,
      actualizar as unknown as ActualizarZonaUseCase,
      obtener as unknown as ObtenerZonaUseCase,
      eliminar as unknown as EliminarZonaUseCase,
      listar as unknown as ListarZonasUseCase,
    );
  });

  const getRoles = (method: Function) =>
    reflector.get<RolEfectivo[]>(ROLES_KEY, method);

  it('POST /zona requiere ADMINISTRADOR', () => {
    expect(getRoles(controller.crearZona)).toEqual([RolEfectivo.ADMINISTRADOR]);
  });

  it('PUT /zona/:id requiere ADMINISTRADOR', () => {
    expect(getRoles(controller.actualizarZona)).toEqual([
      RolEfectivo.ADMINISTRADOR,
    ]);
  });

  it('DELETE /zona/:id requiere ADMINISTRADOR', () => {
    expect(getRoles(controller.eliminarZona)).toEqual([
      RolEfectivo.ADMINISTRADOR,
    ]);
  });

  it('GET /zona no requiere roles específicos', () => {
    expect(getRoles(controller.listarZonas)).toBeUndefined();
  });

  it('GET /zona/:id no requiere roles específicos', () => {
    expect(getRoles(controller.obtenerZona)).toBeUndefined();
  });

  it('crearZona delega en CrearZonaUseCase', async () => {
    crear.execute.mockResolvedValue({ id: 1, nombre: 'Norte' });

    await expect(controller.crearZona({ nombre: 'Norte' })).resolves.toEqual({
      id: 1,
      nombre: 'Norte',
    });
    expect(crear.execute).toHaveBeenCalledWith({ nombre: 'Norte' });
  });

  it('actualizarZona delega en ActualizarZonaUseCase', async () => {
    actualizar.execute.mockResolvedValue({ id: 3, nombre: 'Sur' });

    await controller.actualizarZona(3, { nombre: 'Sur' });

    expect(actualizar.execute).toHaveBeenCalledWith(3, { nombre: 'Sur' });
  });

  it('actualizarZona sin nombre envía un objeto vacío', async () => {
    actualizar.execute.mockResolvedValue({ id: 3, nombre: 'Norte' });

    await controller.actualizarZona(3, {});

    expect(actualizar.execute).toHaveBeenCalledWith(3, {});
  });

  it('obtenerZona delega en ObtenerZonaUseCase', async () => {
    obtener.execute.mockResolvedValue({ id: 3, nombre: 'Norte' });

    await controller.obtenerZona(3);

    expect(obtener.execute).toHaveBeenCalledWith(3);
  });

  it('listarZonas delega en ListarZonasUseCase', async () => {
    listar.execute.mockResolvedValue([]);

    await controller.listarZonas();

    expect(listar.execute).toHaveBeenCalledWith();
  });

  it('eliminarZona delega en EliminarZonaUseCase', async () => {
    eliminar.execute.mockResolvedValue({ id: 3, nombre: 'Norte' });

    await controller.eliminarZona(3);

    expect(eliminar.execute).toHaveBeenCalledWith(3);
  });
});
