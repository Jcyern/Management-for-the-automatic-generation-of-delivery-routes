import type { Pedido } from '../../pedidos/types/pedido';
import { pedidosService } from '../../pedidos/services/pedidosService';

/**
 * Service for handling route generation operations.
 */
export const rutasService = {
  /**
   * Retrieves the list of orders available for route generation.
   *
   * @returns A promise that resolves to an array of Pedido objects.
   */
  async getPedidosDisponibles(): Promise<Pedido[]> {
    return pedidosService.getAll();
  },

  /**
   * Simulates the generation of a route based on selected orders.
   * Currently a placeholder until the backend algorithm is implemented.
   *
   * @param pedidoIds - Array of order IDs selected for the route.
   * @returns A promise that resolves to a mock response.
   * @throws Error if no orders are provided.
   */
  async generateRuta(pedidoIds: string[]): Promise<{ mensaje: string }> {
    if (pedidoIds.length === 0) {
      throw new Error('No hay pedidos seleccionados para generar la ruta');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { mensaje: `Ruta generada con ${pedidoIds.length} pedidos (simulación)` };
  }
};