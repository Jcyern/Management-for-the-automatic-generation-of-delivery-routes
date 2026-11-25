import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Pedido,
  type PedidoParams,
} from '../../domain/Pedido.js';
import { ListarPedidosUseCase } from './ListarPedidosUseCase.js';

const repo = vi.hoisted(() => ({
  guardar: vi.fn(),
  buscarPorId: vi.fn(),
  listar: vi.fn(),
  eliminar: vi.fn(),
}));

function pedidoPersistido(id: number, estado: PedidoParams['estado']): Pedido {
  return Pedido.rehidratar({
    id,
    prioridad: 'Baja',
    tipoEntrega: 'Sin_Clasificar',
    fechaPrevista: new Date('2026-01-01T00:00:00.000Z'),
    fechaEntrega: null,
    estado: estado ?? null,
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
  });
}

describe('ListarPedidosUseCase', () => {
  let useCase: ListarPedidosUseCase;

  beforeEach(() => {
    vi.resetAllMocks();
    repo.listar.mockResolvedValue([
      pedidoPersistido(1, 'Pendiente'),
      pedidoPersistido(2, 'Entregado'),
    ]);
    useCase = new ListarPedidosUseCase(repo as any);
  });

  it('devuelve todos los pedidos cuando no se envía estado', async () => {
    const resultado = await useCase.execute();

    expect(repo.listar).toHaveBeenCalledWith(undefined);
    expect(resultado).toHaveLength(2);
  });

  it('devuelve todos los pedidos cuando el estado es null', async () => {
    const resultado = await useCase.execute(null);

    expect(repo.listar).toHaveBeenCalledWith(undefined);
    expect(resultado).toHaveLength(2);
  });

  it('filtra por estado cuando se envía un valor válido', async () => {
    await useCase.execute('Pendiente');

    expect(repo.listar).toHaveBeenCalledWith('Pendiente');
  });
});
