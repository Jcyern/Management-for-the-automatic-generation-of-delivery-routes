import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GeocodingService } from '../geo/geocoding.service.js';
import { CentroService } from './Centro.service.js';

const prisma = vi.hoisted(() => ({
  centroDeDistribucion: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const geocoding = vi.hoisted(() => ({
  geocodificar: vi.fn(),
  modoEstricto: false,
}));

describe('CentroService', () => {
  let service: CentroService;

  beforeEach(async () => {
    vi.resetAllMocks();
    geocoding.modoEstricto = false;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentroService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeocodingService, useValue: geocoding },
      ],
    }).compile();
    service = module.get(CentroService);
  });

  it('crea un centro, geocodifica la dirección, conecta zonas y asigna al coordinador', async () => {
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);
    geocoding.geocodificar.mockResolvedValue({
      latitud: 23.1,
      longitud: -82.4,
    });
    const creado = {
      id: 1,
      nombre: 'Centro Norte',
      programaLogistico: 'P1',
      direccion: 'Calle 23, La Habana',
      latitud: 23.1,
      longitud: -82.4,
      zonas: [],
    };
    prisma.centroDeDistribucion.create.mockResolvedValue(creado);

    await expect(
      service.create(
        {
          nombre: 'Centro Norte',
          programaLogistico: 'P1',
          direccion: 'Calle 23, La Habana',
          zonasIds: [2, 3],
        },
        7,
      ),
    ).resolves.toEqual(creado);

    expect(geocoding.geocodificar).toHaveBeenCalledWith('Calle 23, La Habana');
    expect(prisma.centroDeDistribucion.create).toHaveBeenCalledWith({
      data: {
        nombre: 'Centro Norte',
        programaLogistico: 'P1',
        direccion: 'Calle 23, La Habana',
        latitud: 23.1,
        longitud: -82.4,
        zonas: { connect: [{ id: 2 }, { id: 3 }] },
        coordinadorCrearRutas: { connect: { idUser: 7 } },
      },
      include: { zonas: true },
    });
  });

  it('acepta coordenadas explícitas sin llamar al geocoding', async () => {
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);
    prisma.centroDeDistribucion.create.mockResolvedValue({ id: 1 });

    await service.create(
      {
        nombre: 'Centro Norte',
        programaLogistico: 'P1',
        latitud: 23.1,
        longitud: -82.4,
      },
      7,
    );

    expect(geocoding.geocodificar).not.toHaveBeenCalled();
    expect(prisma.centroDeDistribucion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ latitud: 23.1, longitud: -82.4 }),
      }),
    );
  });

  it('rechaza crear un centro sin dirección ni coordenadas', async () => {
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);

    await expect(
      service.create({ nombre: 'Centro Norte', programaLogistico: 'P1' }, 7),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.centroDeDistribucion.create).not.toHaveBeenCalled();
  });

  it('rechaza crear un centro con solo una coordenada', async () => {
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          nombre: 'Centro Norte',
          programaLogistico: 'P1',
          latitud: 23.1,
        },
        7,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.centroDeDistribucion.create).not.toHaveBeenCalled();
  });

  it('rechaza crear un centro en modo estricto si el geocoding falla', async () => {
    geocoding.modoEstricto = true;
    geocoding.geocodificar.mockResolvedValue(null);
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          nombre: 'Centro Norte',
          programaLogistico: 'P1',
          direccion: 'Dirección inexistente',
        },
        7,
      ),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);

    expect(prisma.centroDeDistribucion.create).not.toHaveBeenCalled();
  });

  it('crea el centro sin coordenadas en modo tolerante si el geocoding falla', async () => {
    geocoding.geocodificar.mockResolvedValue(null);
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);
    prisma.centroDeDistribucion.create.mockResolvedValue({ id: 1 });

    await service.create(
      {
        nombre: 'Centro Norte',
        programaLogistico: 'P1',
        direccion: 'Dirección inexistente',
      },
      7,
    );

    expect(prisma.centroDeDistribucion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ latitud: null, longitud: null }),
      }),
    );
  });

  it('rechaza un nombre duplicado al crear', async () => {
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 99 });

    await expect(
      service.create({ nombre: 'Centro Norte', programaLogistico: 'P1' }, 7),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.centroDeDistribucion.create).not.toHaveBeenCalled();
  });

  it('filtra los centros por coordinador autorizado', async () => {
    prisma.centroDeDistribucion.findMany.mockResolvedValue([]);

    await service.findAll(7);

    expect(prisma.centroDeDistribucion.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { coordinadorCrearRutas: { some: { idUser: 7 } } },
          { coordinadorValidadRutas: { some: { idUser: 7 } } },
        ],
      },
      include: { zonas: true },
      orderBy: { id: 'asc' },
    });
  });

  it('lanza NotFoundException si el centro no existe', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no actualiza si el coordinador no está autorizado', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);

    await expect(
      service.update(1, { nombre: 'Otro' }, 7),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.centroDeDistribucion.update).not.toHaveBeenCalled();
  });

  it('actualiza el centro y reemplaza las zonas', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.findFirst
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);
    const actualizado = { id: 1, nombre: 'Centro Sur', zonas: [] };
    prisma.centroDeDistribucion.update.mockResolvedValue(actualizado);

    await expect(
      service.update(1, { nombre: 'Centro Sur', zonasIds: [4] }, 7),
    ).resolves.toEqual(actualizado);

    expect(prisma.centroDeDistribucion.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        nombre: 'Centro Sur',
        zonas: { set: [{ id: 4 }] },
      },
      include: { zonas: true },
    });
  });

  it('vuelve a geocodificar al actualizar la dirección', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });
    geocoding.geocodificar.mockResolvedValue({
      latitud: 23.2,
      longitud: -82.5,
    });
    prisma.centroDeDistribucion.update.mockResolvedValue({ id: 1 });

    await service.update(1, { direccion: 'Calle 25, La Habana' }, 7);

    expect(geocoding.geocodificar).toHaveBeenCalledWith('Calle 25, La Habana');
    expect(prisma.centroDeDistribucion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          direccion: 'Calle 25, La Habana',
          latitud: 23.2,
          longitud: -82.5,
        }),
      }),
    );
  });

  it('actualiza coordenadas explícitas sin llamar al geocoding', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.update.mockResolvedValue({ id: 1 });

    await service.update(1, { latitud: 23.3, longitud: -82.6 }, 7);

    expect(geocoding.geocodificar).not.toHaveBeenCalled();
    expect(prisma.centroDeDistribucion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ latitud: 23.3, longitud: -82.6 }),
      }),
    );
  });

  it('rechaza actualizar con solo una coordenada', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });

    await expect(
      service.update(1, { latitud: 23.3 }, 7),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.centroDeDistribucion.update).not.toHaveBeenCalled();
  });

  it('limpia las coordenadas al actualizar la dirección si el geocoding falla', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });
    geocoding.geocodificar.mockResolvedValue(null);
    prisma.centroDeDistribucion.update.mockResolvedValue({ id: 1 });

    await service.update(1, { direccion: 'Dirección rara' }, 7);

    expect(prisma.centroDeDistribucion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ latitud: null, longitud: null }),
      }),
    );
  });

  it('lanza NotFoundException al eliminar un centro inexistente', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue(null);

    await expect(service.remove(99, 7)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.centroDeDistribucion.findFirst).not.toHaveBeenCalled();
  });

  it('no elimina un centro con pedidos o repartidores asociados', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({
      id: 1,
      _count: { pedidos: 1, repartidores: 0 },
    });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });

    await expect(service.remove(1, 7)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.centroDeDistribucion.delete).not.toHaveBeenCalled();
  });

  it('elimina el centro cuando está autorizado y sin dependencias', async () => {
    prisma.centroDeDistribucion.findUnique.mockResolvedValue({
      id: 1,
      _count: { pedidos: 0, repartidores: 0 },
    });
    prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });
    prisma.centroDeDistribucion.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1, 7)).resolves.toEqual({ id: 1 });
    expect(prisma.centroDeDistribucion.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
