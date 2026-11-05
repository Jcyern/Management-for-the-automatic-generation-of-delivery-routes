import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { VehiculoService } from './Vehiculo.service.js';

const prisma = vi.hoisted(() => ({
  vehiculo: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  flota: {
    findUnique: vi.fn(),
  }
}));

describe('VehiculoService', () => {
  let service: VehiculoService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiculoService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(VehiculoService);
  });

  it('crea un vehículo si la flota existe', async () => {
    prisma.flota.findUnique.mockResolvedValue({ id: 1 });
    prisma.vehiculo.create.mockResolvedValue({ id: 1, capacidad: 500, flota: { id: 1 } });

    await expect(service.create({ capacidad: 500, flotaID: 1 })).resolves.toBeDefined();
    expect(prisma.vehiculo.create).toHaveBeenCalled();
  });

  it('lanza error si la flota no existe al crear', async () => {
    prisma.flota.findUnique.mockResolvedValue(null);

    await expect(service.create({ capacidad: 500, flotaID: 99 })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.vehiculo.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si el vehículo no existe', async () => {
    prisma.vehiculo.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no elimina un vehículo con rutas asociadas', async () => {
    prisma.vehiculo.findUnique.mockResolvedValue({
      id: 1,
      _count: { rutasRealizadas: 3 },
    });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.vehiculo.delete).not.toHaveBeenCalled();
  });

  it('elimina el vehículo si no tiene rutas', async () => {
    prisma.vehiculo.findUnique.mockResolvedValue({
      id: 1,
      _count: { rutasRealizadas: 0 },
    });
    prisma.vehiculo.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1)).resolves.toEqual({ id: 1 });
  });
});