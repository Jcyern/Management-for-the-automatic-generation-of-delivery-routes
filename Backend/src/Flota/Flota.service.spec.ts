import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { FlotaService } from './Flota.service.js';

const prisma = vi.hoisted(() => ({
  flota: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('FlotaService', () => {
  let service: FlotaService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlotaService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(FlotaService);
  });

  it('crea una flota exitosamente', async () => {
    prisma.flota.findFirst.mockResolvedValue(null);
    prisma.flota.create.mockResolvedValue({ id: 1, nombre: 'Flota A' });

    await expect(service.create({ nombre: 'Flota A' })).resolves.toEqual({ id: 1, nombre: 'Flota A' });
    expect(prisma.flota.create).toHaveBeenCalledWith({ data: { nombre: 'Flota A' } });
  });

  it('lanza error si intenta crear una flota con nombre duplicado', async () => {
    prisma.flota.findFirst.mockResolvedValue({ id: 2, nombre: 'Flota A' });

    await expect(service.create({ nombre: 'Flota A' })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.flota.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si la flota no existe', async () => {
    prisma.flota.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no elimina una flota con vehículos o repartidores', async () => {
    prisma.flota.findUnique.mockResolvedValue({
      id: 1,
      _count: { vehiculos: 2, repartidores: 0 },
    });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.flota.delete).not.toHaveBeenCalled();
  });

  it('elimina la flota si no tiene dependencias', async () => {
    prisma.flota.findUnique.mockResolvedValue({
      id: 1,
      _count: { vehiculos: 0, repartidores: 0 },
    });
    prisma.flota.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1)).resolves.toEqual({ id: 1 });
  });
});