import type { CoordenadasPedido } from '../../domain/Pedido.js';

export const GEOCODIFICACION_PEDIDO_PORT = Symbol(
  'GEOCODIFICACION_PEDIDO_PORT',
);

export interface GeocodificacionPort {
  /** Política configurada: una dirección sin coordenadas debe rechazarse. */
  readonly modoEstricto: boolean;

  geocodificar(direccion: string): Promise<CoordenadasPedido | null>;
}
