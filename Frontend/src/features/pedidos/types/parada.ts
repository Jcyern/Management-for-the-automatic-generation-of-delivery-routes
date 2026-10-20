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
  estadoEjecucion: string;
}