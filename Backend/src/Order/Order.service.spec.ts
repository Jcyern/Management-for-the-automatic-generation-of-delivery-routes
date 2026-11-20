import { UnprocessableEntityException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GeocodingService } from '../geo/geocoding.service.js';
import { OrderService } from './Order.service.js';
import type { CreateOrderDto, UpdateOrderDto } from './dto/Order.dto.js';

const prisma = vi.hoisted(() => ({
  pedido: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const geocoding = vi.hoisted(() => ({
  geocodificar: vi.fn(),
  modoEstricto: false,
}));

const dtoBase: CreateOrderDto = {
  destinatario: 'Ana Pérez',
  direccion: 'Calle 23 #10',
  idCentro: 1,
  idCoordinador: 2,
  idZona: 3,
  idParada: 4,
};

describe('OrderService (geocoding)', () => {
  let service: OrderService;

  beforeEach(async () => {
    vi.resetAllMocks();
    geocoding.modoEstricto = false;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeocodingService, useValue: geocoding },
      ],
    }).compile();

    service = module.get(OrderService);
  });

  it('guarda las coordenadas al crear un pedido', async () => {
    geocoding.geocodificar.mockResolvedValue({
      latitud: 23.1,
      longitud: -82.4,
    });
    prisma.pedido.create.mockResolvedValue({ id: 1 });

    await service.create(dtoBase);

    expect(geocoding.geocodificar).toHaveBeenCalledWith(dtoBase.direccion);
    expect(prisma.pedido.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          latitud: 23.1,
          longitud: -82.4,
          idParada: 4,
        }),
      }),
    );
  });

  it('crea el pedido sin parada cuando no se envía idParada', async () => {
    geocoding.geocodificar.mockResolvedValue({
      latitud: 23.1,
      longitud: -82.4,
    });
    prisma.pedido.create.mockResolvedValue({ id: 1 });

    const sinParada = Object.assign({}, dtoBase) as CreateOrderDto;
    delete sinParada.idParada;
    await service.create(sinParada);

    expect(prisma.pedido.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ idParada: expect.anything() }),
      }),
    );
  });

  it('crea el pedido sin coordenadas en modo tolerante', async () => {
    geocoding.geocodificar.mockResolvedValue(null);
    prisma.pedido.create.mockResolvedValue({ id: 1 });

    await service.create(dtoBase);

    expect(prisma.pedido.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ latitud: null, longitud: null }),
      }),
    );
  });

  it('rechaza el pedido en modo estricto si no se puede geocodificar', async () => {
    geocoding.modoEstricto = true;
    geocoding.geocodificar.mockResolvedValue(null);

    await expect(service.create(dtoBase)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(prisma.pedido.create).not.toHaveBeenCalled();
  });

  it('vuelve a geocodificar y actualiza coordenadas al cambiar la dirección', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 1 });
    prisma.pedido.update.mockResolvedValue({ id: 1 });
    geocoding.geocodificar.mockResolvedValue({
      latitud: 23.2,
      longitud: -82.5,
    });

    const dto: UpdateOrderDto = { direccion: 'Calle 25 #12' };
    await service.update(1, dto);

    expect(geocoding.geocodificar).toHaveBeenCalledWith('Calle 25 #12');
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          direccion: 'Calle 25 #12',
          latitud: 23.2,
          longitud: -82.5,
        }),
      }),
    );
  });

  it('limpia las coordenadas si la nueva dirección no se puede geocodificar', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 1 });
    prisma.pedido.update.mockResolvedValue({ id: 1 });
    geocoding.geocodificar.mockResolvedValue(null);

    await service.update(1, { direccion: 'Dirección rara' });

    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ latitud: null, longitud: null }),
      }),
    );
  });

  it('no geocodifica si la dirección no cambia', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 1 });
    prisma.pedido.update.mockResolvedValue({ id: 1 });

    await service.update(1, { prioridad: 'Urgente' });

    expect(geocoding.geocodificar).not.toHaveBeenCalled();
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ latitud: expect.anything() }),
      }),
    );
  });
});
