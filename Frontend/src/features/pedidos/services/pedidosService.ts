import type { Pedido, PedidoFilters } from '../types/pedido';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Raw response shape from the backend's /order endpoint.
 * (Based on the Prisma schema and the NestJS service)
 */
interface BackendPedido {
  id: number;
  prioridad: string;
  tipoEntrega: string;
  zona: string;
  idCentro: number;
  idCoordinador: number;
  destinatario: string;
  direccion: string;
  estado: string;
  fechaCreado: string;
  fechaLimite: string | null;
  centro?: { nombre: string };
  coordinador?: { nombre: string };
}

export const pedidosService = {
  /**
   * Retrieves all orders from the backend.
   */
  async getAll(filters?: PedidoFilters): Promise<Pedido[]> {
    const response = await fetch(`${API_URL}/order`);
    if (!response.ok) throw new Error('Error al cargar pedidos');
    
    const data: BackendPedido[] = await response.json();

    let result = data.map((p) => ({
      id: String(p.id),
      centroId: String(p.idCentro),
      zonaId: p.zona,
      tipoEntrega: p.tipoEntrega as any, 
      prioridad: p.prioridad as any,
      estado: p.estado.toLowerCase() as any,
      direccion: p.direccion,
      destinatario: p.destinatario,
      creadoPor: p.coordinador?.nombre || 'Desconocido',
      fechaCreacion: p.fechaCreado, 
    }));

    if (filters?.tipoEntrega) {
      result = result.filter((p) => p.tipoEntrega === filters.tipoEntrega);
    }
    if (filters?.prioridad) {
      result = result.filter((p) => p.prioridad === filters.prioridad);
    }
    if (filters?.estado) {
      result = result.filter((p) => p.estado === filters.estado);
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
   * Creates a new order in the backend.
   */
  async create(
    data: Omit<Pedido, 'id' | 'creadoPor' | 'fechaCreacion' | 'estado'>,
    creadoPor: string
  ): Promise<Pedido> {
    const backendPayload = {
      prioridad: data.prioridad,
      tipoEntrega: data.tipoEntrega,
      zona: data.zonaId,
      idCentro: Number(data.centroId),
      idCoordinador: 1, // TODO: When there's a JWT, this will come from the user's token
      destinatario: data.destinatario,
      direccion: data.direccion,
    };

    const response = await fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) throw new Error('Error al crear el pedido');

    const created = await response.json();
    
    return {
      id: String(created.id),
      centroId: String(created.idCentro),
      zonaId: created.zona,
      tipoEntrega: created.tipoEntrega,
      prioridad: created.prioridad,
      estado: created.estado.toLowerCase(),
      direccion: created.direccion,
      destinatario: created.destinatario,
      creadoPor: creadoPor,
      fechaCreacion: created.fechaCreado,
    };
  },

};