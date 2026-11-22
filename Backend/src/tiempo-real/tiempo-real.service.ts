import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

export const ESTADOS_PARADA = ['Pendiente', 'Visitada', 'Fallida'] as const;
export type EstadoParadaCache = (typeof ESTADOS_PARADA)[number];

const TTL_PARADAS_SEGUNDOS = 24 * 60 * 60;

@Injectable()
export class TiempoRealService {
  constructor(private readonly redis: RedisService) {}

  private claveDisponibilidad(idRepartidor: number): string {
    return `repartidor:${idRepartidor}:disponible`;
  }

  private claveParadas(idRuta: number): string {
    return `ruta:${idRuta}:paradas`;
  }

  async marcarDisponibilidad(
    idRepartidor: number,
    disponible: boolean,
  ): Promise<void> {
    await this.redis.set(
      this.claveDisponibilidad(idRepartidor),
      disponible ? '1' : '0',
    );
  }

  async obtenerDisponibilidad(idRepartidor: number): Promise<boolean> {
    const valor = await this.redis.get(this.claveDisponibilidad(idRepartidor));
    return valor === '1';
  }

  async listarDisponibles(ids: number[]): Promise<number[]> {
    if (ids.length === 0) return [];

    const valores = await this.redis.mget(
      ids.map((id) => this.claveDisponibilidad(id)),
    );
    return ids.filter((_, indice) => valores[indice] === '1');
  }

  async actualizarEstadoParada(
    idRuta: number,
    idParada: number,
    estado: EstadoParadaCache,
  ): Promise<void> {
    const clave = this.claveParadas(idRuta);
    await this.redis.hset(clave, String(idParada), estado);
    await this.redis.expire(clave, TTL_PARADAS_SEGUNDOS);
  }

  async obtenerEstadoParadas(
    idRuta: number,
  ): Promise<Record<string, EstadoParadaCache>> {
    const estados = await this.redis.hgetall(this.claveParadas(idRuta));
    return estados as Record<string, EstadoParadaCache>;
  }
}
