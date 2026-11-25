import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UbicacionNoResuelta } from '../../../../shared/domain/DomainError.js';
import {
  Pedido,
  type PedidoParams,
} from '../../domain/Pedido.js';
import { CrearPedidoUseCase } from './CrearPedidoUseCase.js';

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

const input = {
  destinatario: 'Ana Pérez',
  direccion: 'Calle 23 #10',
  idCentro: 1,
  idCoordinador: 2,
  idZona: 3,
  idParada: 4,
};

describe('CrearPedidoUseCase', () => {
  let useCase: CrearPedidoUseCase;

  beforeEach(() => {
    vi.resetAllMocks();
    geocodificacion.modoEstricto = false;
    repo.guardar.mockResolvedValue(pedidoPersistido());
    useCase = new CrearPedidoUseCase(repo as any, geocodificacion as any);
  });

  it('geocodifica y guarda las coordenadas', async () => {
    geocodificacion.geocodificar.mockResolvedValue({
      latitud: 23.1,
      longitud: -82.4,
    });

    const resultado = await useCase.execute(input);

    expect(geocodificacion.geocodificar).toHaveBeenCalledWith(input.direccion);
    expect(repo.guardar).toHaveBeenCalledTimes(1);
    const guardado = pedidoGuardado();
    expect(guardado.coordenadas).toEqual({ latitud: 23.1, longitud: -82.4 });
    expect(guardado.idParada).toBe(4);
    expect(resultado.id).toBe(1);
  });

  it('guarda idParada en null cuando no se envía', async () => {
    geocodificacion.geocodificar.mockResolvedValue({
      latitud: 23.1,
      longitud: -82.4,
    });

    const { idParada: _idParada, ...sinParada } = input;
    await useCase.execute(sinParada);

    const guardado = pedidoGuardado();
    expect(guardado.idParada).toBeNull();
  });

  it('modo tolerante guarda coordenadas null', async () => {
    geocodificacion.geocodificar.mockResolvedValue(null);

    await useCase.execute(input);

    const guardado = pedidoGuardado();
    expect(guardado.coordenadas).toBeNull();
  });

  it('modo estricto rechaza antes de persistir', async () => {
    geocodificacion.modoEstricto = true;
    geocodificacion.geocodificar.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      UbicacionNoResuelta,
    );
    expect(repo.guardar).not.toHaveBeenCalled();
  });
});
