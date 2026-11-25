import type { EstadoPedidoDominio } from '../../domain/Pedido.js';
import type { PedidoOutput } from '../dto/PedidoDtos.js';
import { aPedidoOutput } from '../mappers/PedidoMapper.js';
import type { PedidoRepositoryPort } from '../ports/PedidoRepositoryPort.js';

export class ListarPedidosUseCase {
  private readonly repo: PedidoRepositoryPort;

  constructor(repo: PedidoRepositoryPort) {
    this.repo = repo;
  }

  async execute(
    estado?: EstadoPedidoDominio | null,
  ): Promise<PedidoOutput[]> {
    const pedidos = await this.repo.listar(estado ?? undefined);
    return pedidos.map(aPedidoOutput);
  }
}
