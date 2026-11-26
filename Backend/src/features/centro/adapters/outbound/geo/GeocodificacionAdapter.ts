import { Injectable } from '@nestjs/common';
import { GeocodingService } from '../../../../../geo/geocoding.service.js';
import type {
  CoordenadasGeo,
  GeocodificacionPort,
} from '../../../application/ports/GeocodificacionPort.js';

@Injectable()
export class GeocodificacionAdapter implements GeocodificacionPort {
  private readonly geo: GeocodingService;

  constructor(geo: GeocodingService) {
    this.geo = geo;
  }

  get modoEstricto(): boolean {
    return this.geo.modoEstricto;
  }

  geocodificar(direccion: string): Promise<CoordenadasGeo | null> {
    return this.geo.geocodificar(direccion);
  }
}
