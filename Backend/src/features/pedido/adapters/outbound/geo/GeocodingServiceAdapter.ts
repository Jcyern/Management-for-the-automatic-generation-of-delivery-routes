import { Injectable } from '@nestjs/common';
import { GeocodingService } from '../../../../../geo/geocoding.service.js';
import type { GeocodificacionPort } from '../../../application/ports/GeocodificacionPort.js';
import type { CoordenadasPedido } from '../../../domain/Pedido.js';

/**
 * Adaptador outbound: traduce el servicio de geocodificación existente al
 * puerto del contexto Pedido. La migración de Geo como contexto hexagonal
 * se hará en su propio PR.
 */
@Injectable()
export class GeocodingServiceAdapter implements GeocodificacionPort {
  constructor(private readonly geocoding: GeocodingService) {}

  get modoEstricto(): boolean {
    return this.geocoding.modoEstricto;
  }

  async geocodificar(direccion: string): Promise<CoordenadasPedido | null> {
    const coordenadas = await this.geocoding.geocodificar(direccion);
    if (!coordenadas) {
      return null;
    }
    return { latitud: coordenadas.latitud, longitud: coordenadas.longitud };
  }
}
