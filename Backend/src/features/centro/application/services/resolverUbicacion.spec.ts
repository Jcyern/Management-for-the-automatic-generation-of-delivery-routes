import { describe, expect, it, vi } from 'vitest';
import {
  EntidadNoProcesable,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import {
  resolverUbicacionParaActualizar,
  resolverUbicacionParaCrear,
} from './resolverUbicacion.js';

interface OpcionesGeo {
  modoEstricto?: boolean;
  resultado?: { latitud: number; longitud: number } | null;
}

function crearGeo({ modoEstricto = false, resultado }: OpcionesGeo = {}) {
  const geocodificar = vi
    .fn()
    .mockResolvedValue(
      resultado === undefined ? { latitud: 23.1, longitud: -82.4 } : resultado,
    );
  const geo: GeocodificacionPort = { geocodificar, modoEstricto };
  return { geo, geocodificar };
}

describe('resolverUbicacion', () => {
  describe('crear', () => {
    it('usa coordenadas explícitas sin geocodificar', async () => {
      const { geo, geocodificar } = crearGeo();

      const ubicacion = await resolverUbicacionParaCrear(geo, {
        latitud: 10,
        longitud: 20,
      });

      expect(ubicacion.latitud).toBe(10);
      expect(ubicacion.longitud).toBe(20);
      expect(geocodificar).not.toHaveBeenCalled();
    });

    it('rechaza una sola coordenada', async () => {
      const { geo } = crearGeo();

      await expect(
        resolverUbicacionParaCrear(geo, { latitud: 10 }),
      ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
    });

    it('geocodifica la dirección', async () => {
      const { geo } = crearGeo({ resultado: { latitud: 1, longitud: 2 } });

      const ubicacion = await resolverUbicacionParaCrear(geo, {
        direccion: 'Calle 23',
      });

      expect(ubicacion).toEqual({
        direccion: 'Calle 23',
        latitud: 1,
        longitud: 2,
      });
    });

    it('lanza 422 si el geocoding falla en modo estricto', async () => {
      const { geo } = crearGeo({ resultado: null, modoEstricto: true });

      await expect(
        resolverUbicacionParaCrear(geo, { direccion: 'Calle 23' }),
      ).rejects.toBeInstanceOf(EntidadNoProcesable);
    });

    it('tolera el fallo limpiando las coordenadas', async () => {
      const { geo } = crearGeo({ resultado: null, modoEstricto: false });

      const ubicacion = await resolverUbicacionParaCrear(geo, {
        direccion: 'Calle 23',
      });

      expect(ubicacion).toEqual({
        direccion: 'Calle 23',
        latitud: null,
        longitud: null,
      });
    });

    it('exige ubicación al crear', async () => {
      const { geo } = crearGeo();

      await expect(
        resolverUbicacionParaCrear(geo, {}),
      ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
    });
  });

  describe('actualizar', () => {
    it('devuelve undefined si no se envía ubicación', async () => {
      const { geo, geocodificar } = crearGeo();

      await expect(
        resolverUbicacionParaActualizar(geo, {}),
      ).resolves.toBeUndefined();
      expect(geocodificar).not.toHaveBeenCalled();
    });

    it('resuelve coordenadas explícitas', async () => {
      const { geo } = crearGeo();

      const ubicacion = await resolverUbicacionParaActualizar(geo, {
        latitud: 3,
        longitud: 4,
      });

      expect(ubicacion?.latitud).toBe(3);
      expect(ubicacion?.longitud).toBe(4);
    });

    it('geocodifica la dirección', async () => {
      const { geo } = crearGeo({ resultado: { latitud: 5, longitud: 6 } });

      const ubicacion = await resolverUbicacionParaActualizar(geo, {
        direccion: 'Calle 8',
      });

      expect(ubicacion).toEqual({
        direccion: 'Calle 8',
        latitud: 5,
        longitud: 6,
      });
    });

    it('rechaza una sola coordenada', async () => {
      const { geo } = crearGeo();

      await expect(
        resolverUbicacionParaActualizar(geo, { longitud: 4 }),
      ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
    });
  });
});
