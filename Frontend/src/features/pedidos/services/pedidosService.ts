import type { Pedido, PedidoFilters } from '../types/pedido';
import { PEDIDOS_MOCK } from '../mocks/pedidosMock';

const STORAGE_KEY = 'pedidos_mock';

/**
 * Reads the orders from localStorage, falling back to the initial mock
 * the first time the app runs.
 */
function readStorage(): Pedido[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PEDIDOS_MOCK));
    return [...PEDIDOS_MOCK];
  }
  try {
    return JSON.parse(raw) as Pedido[];
  } catch {
    return [...PEDIDOS_MOCK];
  }
}

/**
 * Writes the given orders to localStorage.
 */
function writeStorage(pedidos: Pedido[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
}

/**
 * Delivery orders service.
 *
 * Backed by localStorage while the backend is not available. When the
 * backend is ready, only the body of each method needs to change to an
 * HTTP call. The rest of the application does not need to be touched.
 */
export const pedidosService = {
  /**
   * Retrieves all orders matching the given filters.
   *
   * @param filters - Optional filters to apply.
   * @returns A promise that resolves to the filtered list of orders.
   */
  async getAll(filters?: PedidoFilters): Promise<Pedido[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let result = readStorage();

    if (filters?.tipoEntrega) {
      result = result.filter((p) => p.tipoEntrega === filters.tipoEntrega);
    }
    if (filters?.prioridad) {
      result = result.filter((p) => p.prioridad === filters.prioridad);
    }
    if (filters?.estado) {
      result = result.filter((p) => p.estado === filters.estado);
    }
    if (filters?.zonaId) {
      result = result.filter((p) => p.zonaId === filters.zonaId);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(term) ||
          p.destinatario.toLowerCase().includes(term) ||
          p.direccion.toLowerCase().includes(term)
      );
    }

    return result;
  },

  /**
   * Retrieves a single order by its id.
   *
   * @param id - Identifier of the order.
   * @returns A promise that resolves to the order, or `null` if not found.
   */
  async getById(id: string): Promise<Pedido | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return readStorage().find((p) => p.id === id) ?? null;
  },

  /**
   * Creates a new order.
   *
   * @param data - Order fields without the id (auto-generated) or creadoPor.
   * @param creadoPor - Name of the coordinador creating the order.
   * @returns A promise that resolves to the created order.
   */
  async create(
    data: Omit<Pedido, 'id' | 'creadoPor' | 'fechaCreacion' | 'estado'>,
    creadoPor: string
  ): Promise<Pedido> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pedidos = readStorage();
    const nextNumber = String(pedidos.length + 1).padStart(3, '0');

    const nuevo: Pedido = {
      ...data,
      id: `P-${nextNumber}`,
      estado: 'pendiente',
      creadoPor,
      fechaCreacion: new Date().toISOString(),
    };

    pedidos.push(nuevo);
    writeStorage(pedidos);
    return nuevo;
  },

  /**
   * Updates an existing order.
   *
   * @param id - Identifier of the order to update.
   * @param data - Fields to update.
   * @returns A promise that resolves to the updated order.
   * @throws Error if the order does not exist.
   */
  async update(id: string, data: Partial<Pedido>): Promise<Pedido> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pedidos = readStorage();
    const index = pedidos.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Pedido no encontrado');

    pedidos[index] = { ...pedidos[index], ...data };
    writeStorage(pedidos);
    return pedidos[index];
  },

  /**
   * Deletes an order by its id.
   *
   * @param id - Identifier of the order to delete.
   */
  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pedidos = readStorage().filter((p) => p.id !== id);
    writeStorage(pedidos);
  },

  /**
   * Resets the mock data to the original seed. Useful for development.
   */
  resetMock(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PEDIDOS_MOCK));
  },
};