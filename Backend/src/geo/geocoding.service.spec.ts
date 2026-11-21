import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GeocodingService } from './geocoding.service.js';
import { GEOCODING_PROVIDER, type GeocodingProvider } from './geo.types.js';

const prisma = vi.hoisted(() => ({
  geocodingCache: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

const geocodificarMock = vi.hoisted(() => vi.fn());

const provider: GeocodingProvider = {
  nombre: 'fake',
  geocodificar: (direccion) => geocodificarMock(direccion),
};

function crearConfig(estricto = false) {
  return {
    get: vi.fn((clave: string) => (clave === 'GEO_ESTRICTO' ? String(estricto) : undefined)),
  };
}

describe('GeocodingService', () => {
  let service: GeocodingService;

  async function compilar(estricto = false) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocodingService,
        { provide: PrismaService, useValue: prisma },
        { provide: GEOCODING_PROVIDER, useValue: provider },
        { provide: ConfigService, useValue: crearConfig(estricto) },
      ],
    }).compile();

    service = module.get(GeocodingService);
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    await compilar();
  });

  it('usa la caché y no llama al proveedor si la dirección ya existe', async () => {
    prisma.geocodingCache.findUnique.mockResolvedValue({
      direccionNormalizada: 'calle 23',
      latitud: 23.1,
      longitud: -82.4,
    });

    await expect(service.geocodificar('Calle 23')).resolves.toEqual({
      latitud: 23.1,
      longitud: -82.4,
    });
    expect(geocodificarMock).not.toHaveBeenCalled();
  });

  it('geocodifica y guarda el resultado en caché', async () => {
    prisma.geocodingCache.findUnique.mockResolvedValue(null);
    prisma.geocodingCache.upsert.mockResolvedValue({});
    geocodificarMock.mockResolvedValue({ latitud: 23.1, longitud: -82.4 });

    await expect(service.geocodificar('  Calle  23 ')).resolves.toEqual({
      latitud: 23.1,
      longitud: -82.4,
    });
    expect(geocodificarMock).toHaveBeenCalledWith('calle 23');
    expect(prisma.geocodingCache.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { direccionNormalizada: 'calle 23' },
        create: expect.objectContaining({ latitud: 23.1, longitud: -82.4, proveedor: 'fake' }),
      }),
    );
  });

  it('devuelve null y no cachea cuando el proveedor no encuentra la dirección', async () => {
    prisma.geocodingCache.findUnique.mockResolvedValue(null);
    geocodificarMock.mockResolvedValue(null);

    await expect(service.geocodificar('Dirección inexistente')).resolves.toBeNull();
    expect(prisma.geocodingCache.upsert).not.toHaveBeenCalled();
  });

  it('devuelve null cuando el proveedor falla', async () => {
    prisma.geocodingCache.findUnique.mockResolvedValue(null);
    geocodificarMock.mockRejectedValue(new Error('timeout'));

    await expect(service.geocodificar('Calle 23')).resolves.toBeNull();
    expect(prisma.geocodingCache.upsert).not.toHaveBeenCalled();
  });

  it('rechaza una dirección vacía', async () => {
    await expect(service.geocodificar('   ')).rejects.toBeInstanceOf(BadRequestException);
    expect(geocodificarMock).not.toHaveBeenCalled();
  });

  it('expone el modo estricto desde la configuración', async () => {
    expect(service.modoEstricto).toBe(false);

    vi.resetAllMocks();
    await compilar(true);
    expect(service.modoEstricto).toBe(true);
  });
});
