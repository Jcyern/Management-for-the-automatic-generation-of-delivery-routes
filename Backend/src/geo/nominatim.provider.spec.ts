import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NominatimProvider } from './nominatim.provider.js';

function crearConfig(valores: Record<string, string> = {}): ConfigService {
  return {
    get: vi.fn((clave: string) => valores[clave]),
  } as unknown as ConfigService;
}

describe('NominatimProvider', () => {
  const fetchMock = vi.fn();
  let provider: NominatimProvider;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    provider = new NominatimProvider(
      crearConfig({
        GEO_BASE_URL: 'https://geo.test/',
        GEO_USER_AGENT: 'test-agent',
        GEO_TIMEOUT_MS: '500',
        GEO_MIN_INTERVAL_MS: '0',
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('consulta Nominatim con la dirección y devuelve coordenadas numéricas', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '23.1136', lon: '-82.3666' }],
    });

    await expect(provider.geocodificar('calle 23 #10')).resolves.toEqual({
      latitud: 23.1136,
      longitud: -82.3666,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect((url as URL).origin).toBe('https://geo.test');
    expect((url as URL).pathname).toBe('/search');
    expect((url as URL).searchParams.get('q')).toBe('calle 23 #10');
    expect((url as URL).searchParams.get('format')).toBe('jsonv2');
    expect((init as RequestInit).headers).toMatchObject({ 'User-Agent': 'test-agent' });
  });

  it('devuelve null si el proveedor no encuentra resultados', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    await expect(provider.geocodificar('dirección inexistente')).resolves.toBeNull();
  });

  it('lanza si la respuesta HTTP no es correcta', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests' });

    await expect(provider.geocodificar('calle 23')).rejects.toThrow('429');
  });

  it('devuelve null si las coordenadas vienen fuera de rango', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [{ lat: '999', lon: '0' }] });

    await expect(provider.geocodificar('calle 23')).resolves.toBeNull();
  });

  it('devuelve null si la respuesta no tiene el formato esperado', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ error: 'algo' }) });

    await expect(provider.geocodificar('calle 23')).resolves.toBeNull();
  });
});
