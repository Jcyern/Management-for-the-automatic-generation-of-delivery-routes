import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Coordenadas, GeocodingProvider } from './geo.types.js';

const BASE_URL_POR_DEFECTO = 'https://nominatim.openstreetmap.org';
const USER_AGENT_POR_DEFECTO = 'management-delivery-routes/1.0';
const TIMEOUT_MS_POR_DEFECTO = 8000;
const INTERVALO_MIN_MS_POR_DEFECTO = 1000;

/**
 * Proveedor de geocoding basado en Nominatim (OpenStreetMap).
 *
 * Respeta la política de uso del servicio: User-Agent identificable y como
 * máximo una petición por segundo (las llamadas se serializan en una cola).
 */
@Injectable()
export class NominatimProvider implements GeocodingProvider {
  readonly nombre = 'nominatim';

  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;
  private readonly intervaloMinMs: number;

  /** Cola que serializa las peticiones para no superar el rate limit. */
  private cola: Promise<unknown> = Promise.resolve();
  private ultimaLlamada = 0;

  constructor(config: ConfigService) {
    this.baseUrl = (config.get<string>('GEO_BASE_URL') ?? BASE_URL_POR_DEFECTO).replace(/\/+$/, '');
    this.userAgent = config.get<string>('GEO_USER_AGENT') ?? USER_AGENT_POR_DEFECTO;
    this.timeoutMs = leerEntero(config.get<string>('GEO_TIMEOUT_MS'), TIMEOUT_MS_POR_DEFECTO);
    this.intervaloMinMs = leerEntero(
      config.get<string>('GEO_MIN_INTERVAL_MS'),
      INTERVALO_MIN_MS_POR_DEFECTO,
    );
  }

  async geocodificar(direccion: string): Promise<Coordenadas | null> {
    return this.enCola(async () => {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.set('q', direccion);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '0');

      const respuesta = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'es',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!respuesta.ok) {
        throw new Error(`Nominatim respondió ${respuesta.status} ${respuesta.statusText}`);
      }

      const datos: unknown = await respuesta.json();
      if (!Array.isArray(datos) || datos.length === 0) {
        return null;
      }

      return leerCoordenadas(datos[0]);
    });
  }

  /** Encadena la tarea detrás de la anterior y espera el intervalo mínimo. */
  private enCola<T>(tarea: () => Promise<T>): Promise<T> {
    const ejecucion = this.cola.then(async () => {
      const espera = this.intervaloMinMs - (Date.now() - this.ultimaLlamada);
      if (espera > 0) {
        await new Promise((resolver) => setTimeout(resolver, espera));
      }
      this.ultimaLlamada = Date.now();
      return tarea();
    });

    // La cola no debe quedar rechazada si una tarea falla.
    this.cola = ejecucion.then(
      () => undefined,
      () => undefined,
    );

    return ejecucion;
  }
}

function leerEntero(valor: string | undefined, porDefecto: number): number {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : porDefecto;
}

function leerCoordenadas(resultado: unknown): Coordenadas | null {
  if (typeof resultado !== 'object' || resultado === null) {
    return null;
  }

  const { lat, lon } = resultado as Record<string, unknown>;
  const latitud = Number(lat);
  const longitud = Number(lon);

  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    return null;
  }
  if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
    return null;
  }

  return { latitud, longitud };
}
