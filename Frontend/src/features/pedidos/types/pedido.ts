/**
 * Type of delivery for an order.
 */
export type TipoEntrega = 'paqueteria' | 'documentos' | 'perecederos';

/**
 * Priority level assigned to an order.
 */
export type Prioridad = 'baja' | 'media' | 'urgente';

/**
 * Lifecycle state of an order.
 */
export type EstadoPedido =
  | 'pendiente'
  | 'en_ruta'
  | 'entregado'
  | 'fallido'
  | 'reprogramado';

/**
 * Represents a delivery order in the system.
 */
export interface Pedido {
  /** Unique identifier. */
  id: string;

  /** Distribution center the order belongs to. */
  centroId: string;

  /** Zone within the distribution center. */
  zonaId: string;

  /** Type of delivery. */
  tipoEntrega: TipoEntrega;

  /** Priority level. */
  prioridad: Prioridad;

  /** Current lifecycle state. */
  estado: EstadoPedido;

  /** Delivery address. */
  direccion: string;

  /** Recipient name. */
  destinatario: string;

  /** Coordinador who created the order. */
  creadoPor: string;

  /** ISO date when the order was created. */
  fechaCreacion: string;
}

/**
 * Filters available for the orders list.
 */
export interface PedidoFilters {
  tipoEntrega?: TipoEntrega;
  prioridad?: Prioridad;
  estado?: EstadoPedido;
  zonaId?: string;
  search?: string;
}