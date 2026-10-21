/**
 * Unit tests for the `paradasService`.
 *
 * Verifies that a successful response returns the created stop and that
 * backend error messages are propagated to the UI.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { paradasService } from './paradasService';

describe('paradasService.create', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return the created stop', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, idPedido: 7, estadoEjecucion: 'PENDIENTE' }),
    });

    const parada = await paradasService.create({ idPedido: 7, estadoEjecucion: 'PENDIENTE' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/paradas'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(parada).toEqual({ id: 1, idPedido: 7, estadoEjecucion: 'PENDIENTE' });
  });

  it('should throw the backend message on 404', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ statusCode: 404, message: 'No existe el pedido 99' }),
    });

    await expect(
      paradasService.create({ idPedido: 99, estadoEjecucion: 'PENDIENTE' })
    ).rejects.toThrow('No existe el pedido 99');
  });

  it('should join validation messages on 400', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: ['idPedido debe ser un entero'] }),
    });

    await expect(
      paradasService.create({ idPedido: 0, estadoEjecucion: 'PENDIENTE' })
    ).rejects.toThrow('idPedido debe ser un entero');
  });

  it('should throw a generic error when the body has no message', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: () => Promise.reject(new Error('no json')) });

    await expect(
      paradasService.create({ idPedido: 5, estadoEjecucion: 'PENDIENTE' })
    ).rejects.toThrow('Error al crear la parada');
  });
});
