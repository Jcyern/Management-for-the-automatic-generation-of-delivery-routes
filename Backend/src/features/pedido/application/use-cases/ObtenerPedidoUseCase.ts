import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { PedidoOutput } from '../dto/PedidoDtos.js';
import { aPedidoOutput } from '../mappers/PedidoMapper.js';
import type { PedidoRepositoryPort } from '../ports/PedidoRepositoryPort.js';

export class ObtenerPedidoUseCase {
  private readonly repo: PedidoRepositoryPort;

  constructor(repo: PedidoRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<PedidoOutput> {
    const pedido = await this.repo.buscarPorId(id);
    if (!pedido) {
      throw new RecursoNoEncontrado('Pedido', id);
    }
    return aPedidoOutput(pedido);
  }
}
