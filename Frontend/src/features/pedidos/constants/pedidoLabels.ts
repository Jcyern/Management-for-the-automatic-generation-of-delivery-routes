import type { TipoEntrega, Prioridad, EstadoPedido } from '../types/pedido';

/**
 * Client-readable labels for the delivery type values.
 */
export const TIPO_ENTREGA_LABELS: Record<TipoEntrega, string> = {
  paqueteria: 'Paquetería',
  documentos: 'Documentos',
  perecederos: 'Perecederos',
};

/**
 * Client-readable labels for the priority values.
 */
export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  urgente: 'Urgente',
};

/**
 * Client-readable labels for the order state values.
 */
export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  fallido: 'Fallido',
  reprogramado: 'Reprogramado',
};