import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GEOCODING_PROVIDER, type Coordenadas, type GeocodingProvider } from './geo.types.js';
import { normalizarDireccion, sonCoordenadasValidas } from './geo.utils.js';

/**
 * Resuelve direcciones a coordenadas usando un proveedor externo y una caché
 * persistente en base de datos.
 *
 * - Si la dirección ya fue geocodificada, no se llama al proveedor.
 * - Si el proveedor falla o no encuentra la dirección, devuelve `null` y deja
 *   que la capa de negocio decida (modo estricto o tolerante).
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly estricto: boolean;

  constructor(
    @Inject(GEOCODING_PROVIDER) private readonly provider: GeocodingProvider,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.estricto = config.get<string>('GEO_ESTRICTO') === 'true';
  }

  /** Indica si una dirección sin coordenadas debe rechazarse. */
  get modoEstricto(): boolean {
    return this.estricto;
  }

  async geocodificar(direccion: string): Promise<Coordenadas | null> {
    const normalizada = normalizarDireccion(direccion);
    if (!normalizada) {
      throw new BadRequestException('La dirección no puede estar vacía.');
    }

    const cacheada = await this.prisma.geocodingCache.findUnique({
      where: { direccionNormalizada: normalizada },
    });
    if (cacheada) {
      return { latitud: cacheada.latitud, longitud: cacheada.longitud };
    }

    let coordenadas: Coordenadas | null;
    try {
      coordenadas = await this.provider.geocodificar(normalizada);
    } catch (error) {
      this.logger.warn(
        `El proveedor de geocoding falló para "${normalizada}": ${mensajeDeError(error)}`,
      );
      return null;
    }

    if (!sonCoordenadasValidas(coordenadas)) {
      this.logger.warn(`No se encontraron coordenadas válidas para "${normalizada}".`);
      return null;
    }

    await this.guardarEnCache(normalizada, coordenadas);
    return coordenadas;
  }

  private async guardarEnCache(
    direccionNormalizada: string,
    coordenadas: Coordenadas,
  ): Promise<void> {
    try {
      const datos = {
        latitud: coordenadas.latitud,
        longitud: coordenadas.longitud,
        proveedor: this.provider.nombre,
      };

      await this.prisma.geocodingCache.upsert({
        where: { direccionNormalizada },
        create: { direccionNormalizada, ...datos },
        update: datos,
      });
    } catch (error) {
      // Fallar al cachear no debe impedir crear el pedido.
      this.logger.warn(
        `No se pudo guardar el geocoding de "${direccionNormalizada}" en caché: ${mensajeDeError(error)}`,
      );
    }
  }
}

function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
