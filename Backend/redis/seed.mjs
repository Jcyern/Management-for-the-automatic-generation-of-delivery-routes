import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Redis } from 'ioredis';

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, '..', '.env') });

const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
const redis = new Redis(url);

const TTL_PARADAS_SEGUNDOS = 24 * 60 * 60;

try {
  // --- Disponibilidad de repartidores ---
  const disponibilidad = [
    { id: 1, disponible: true },
    { id: 2, disponible: false },
    { id: 3, disponible: true },
  ];

  for (const repartidor of disponibilidad) {
    await redis.set(
      `repartidor:${repartidor.id}:disponible`,
      repartidor.disponible ? '1' : '0',
    );
  }

  // --- Estado de paradas de una ruta ---
  const claveParadas = 'ruta:1:paradas';
  const paradas = {
    1: 'Visitada',
    2: 'Pendiente',
    3: 'Pendiente',
  };

  await redis.del(claveParadas);
  for (const [idParada, estado] of Object.entries(paradas)) {
    await redis.hset(claveParadas, idParada, estado);
  }
  await redis.expire(claveParadas, TTL_PARADAS_SEGUNDOS);

  console.log(
    `Seed de Redis completado (${disponibilidad.length} repartidores, ${Object.keys(paradas).length} paradas).`,
  );
} catch (error) {
  console.error('Error en el seed de Redis:', error);
  process.exitCode = 1;
} finally {
  await redis.quit();
}