/**
 * Execution states supported by the backend for a stop.
 */
export type EstadoEjecucion = 'PENDIENTE' | 'EN_CAMINO' | 'COMPLETADA' | 'CANCELADA';

/**
 * Represents a stop (parada) associated with an order.
 */
export interface Parada {
  id: number;
  idPedido: number | null;
  estadoEjecucion: string;
}

/**
 * Payload required to create a new stop.
 * Matches the backend's CrearParadaDto.
 */
export interface CreateParadaDto {
  idPedido: number;
  estadoEjecucion: EstadoEjecucion;
}
