import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import {
  Pedido,
  type PedidoParams,
} from '../../domain/Pedido.js';
import { ActualizarPedidoUseCase } from './ActualizarPedidoUseCase.js';

const repo = vi.hoisted(() => ({
  guardar: vi.fn(),
  buscarPorId: vi.fn(),
  listar: vi.fn(),
  eliminar: vi.fn(),
}));

const geocodificacion = vi.hoisted(() => ({
  geocodificar: vi.fn(),
  modoEstricto: false,
}));

function pedidoPersistido(overrides: Partial<PedidoParams> = {}): Pedido {
  return Pedido.rehidratar({
    id: 1,
    prioridad: 'Baja',
    tipoEntrega: 'Sin_Clasificar',
    fechaPrevista: new Date('2026-01-01T00:00:00.000Z'),
    fechaEntrega: null,
    estado: 'Pendiente',
    destinatario: 'Ana Pérez',
    direccion: 'Calle 23 #10',
    coordenadas: { latitud: 23.1, longitud: -82.4 },
    idParada: null,
    idCentro: 1,
    idCoordinador: 2,
    idRuta: null,
    idZona: 3,
    centro: {
      id: 1,
      nombre: 'Centro Norte',
      programaLogistico: 'Programa',
      direccion: null,
      latitud: null,
      longitud: null,
    },
    coordinador: { idUser: 2, nombre: 'Coordinador', especialidad: 'LOGISTICO' },
    ...overrides,
  });
}

function pedidoGuardado(): Pedido {
  expect(repo.guardar).toHaveBeenCalledTimes(1);
  return repo.guardar.mock.calls[0]![0]! as Pedido;
}

describe('ActualizarPedidoUseCase', () => {
  let useCase: ActualizarPedidoUseCase;

  beforeEach(() => {
    vi.resetAllMocks();
    geocodificacion.modoEstricto = false;
    repo.buscarPorId.mockResolvedValue(pedidoPersistido());
    repo.guardar.mockImplementation(async (pedido: Pedido) => pedido);
    useCase = new ActualizarPedidoUseCase(repo as any, geocodificacion as any);
  });

  it('vuelve a geocodificar y actualiza coordenadas al cambiar la dirección', async () => {
    geocodificacion.geocodificar.mockResolvedValue({
      latitud: 23.2,
      longitud: -82.5,
    });

    await useCase.execute(1, { direccion: 'Calle 25 #12' });

    expect(geocodificacion.geocodificar).toHaveBeenCalledWith('Calle 25 #12');
    const guardado = pedidoGuardado();
    expect(guardado.direccion).toBe('Calle 25 #12');
    expect(guardado.coordenadas).toEqual({ latitud: 23.2, longitud: -82.5 });
  });

  it('limpia coordenadas si la nueva dirección no se puede geocodificar', async () => {
    geocodificacion.geocodificar.mockResolvedValue(null);

    await useCase.execute(1, { direccion: 'Dirección rara' });

    const guardado = pedidoGuardado();
    expect(guardado.coordenadas).toBeNull();
  });

  it('no geocodifica si la dirección no cambia', async () => {
    await useCase.execute(1, { prioridad: 'Urgente' });

    expect(geocodificacion.geocodificar).not.toHaveBeenCalled();
    const guardado = pedidoGuardado();
    expect(guardado.coordenadas).toEqual({ latitud: 23.1, longitud: -82.4 });
    expect(guardado.prioridad).toBe('Urgente');
  });

  it('falla con 404 de dominio si el pedido no existe', async () => {
    repo.buscarPorId.mockResolvedValue(null);

    await expect(useCase.execute(99, { prioridad: 'Urgente' })).rejects.toBeInstanceOf(
      RecursoNoEncontrado,
    );
    expect(repo.guardar).not.toHaveBeenCalled();
  });
});
