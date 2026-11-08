import {BadRequestException, ConflictException, ForbiddenException, NotFoundException,} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
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

describe('CentroService', () => {
  let service: CentroService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CentroService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(CentroService);
  });

  it('crea un centro, conecta zonas y asigna al coordinador', async () => {
    prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);
    const creado = {
      id: 1,
      nombre: 'Centro Norte',
      programaLogistico: 'P1',
      zonas: [],
    };
    prisma.centroDeDistribucion.create.mockResolvedValue(creado);

    await expect(
      service.create(
        { nombre: 'Centro Norte', programaLogistico: 'P1', zonasIds: [2, 3] },
        7,
      ),
    ).resolves.toEqual(creado);

    expect(prisma.centroDeDistribucion.create).toHaveBeenCalledWith({
      data: {
        nombre: 'Centro Norte',
        programaLogistico: 'P1',
        zonas: { connect: [{ id: 2 }, { id: 3 }] },
        coordinadorCrearRutas: { connect: { idUser: 7 } },
      },
      include: { zonas: true },
    });
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
