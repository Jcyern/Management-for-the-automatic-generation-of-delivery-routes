import type {
  EstadoPedidoDominio,
  Pedido,
} from '../../domain/Pedido.js';

export const PEDIDO_REPOSITORY = Symbol('PEDIDO_REPOSITORY');

export interface PedidoRepositoryPort {
  guardar(pedido: Pedido): Promise<Pedido>;
  buscarPorId(id: number): Promise<Pedido | null>;
  listar(estado?: EstadoPedidoDominio): Promise<Pedido[]>;
  eliminar(id: number): Promise<Pedido>;
}
