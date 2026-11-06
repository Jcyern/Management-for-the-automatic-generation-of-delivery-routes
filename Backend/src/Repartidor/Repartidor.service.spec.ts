import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { RepartidorService } from './Repartidor.service.js';

const prisma = vi.hoisted(() => ({
  repartidor: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  flota: { findUnique: vi.fn() },
  usuario: { findUnique: vi.fn() },
}));

describe('RepartidorService', () => {
  let service: RepartidorService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepartidorService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(RepartidorService);
  });

  it('crea un repartidor si la flota y el usuario existen', async () => {
    prisma.flota.findUnique.mockResolvedValue({ id: 1 });
    prisma.usuario.findUnique.mockResolvedValue({ id: 10 });
    prisma.repartidor.create.mockResolvedValue({ idUser: 10, nombre: 'Juan' });

    await expect(service.create({ idUser: 10, nombre: 'Juan', edad: 25, idFlota: 1 })).resolves.toBeDefined();
    expect(prisma.repartidor.create).toHaveBeenCalled();
  });

  it('lanza error si la flota no existe', async () => {
    prisma.flota.findUnique.mockResolvedValue(null);
    await expect(service.create({ idUser: 10, nombre: 'Juan', edad: 25, idFlota: 99 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza NotFoundException si el repartidor no existe', async () => {
    prisma.repartidor.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no elimina un repartidor con rutas asociadas', async () => {
    prisma.repartidor.findUnique.mockResolvedValue({
      idUser: 1,
      _count: { rutasAsignadas: 1, rutasRealizadas: 0 },
    });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.repartidor.delete).not.toHaveBeenCalled();
  });

  it('elimina el repartidor si no tiene rutas', async () => {
    prisma.repartidor.findUnique.mockResolvedValue({
      idUser: 1,
      _count: { rutasAsignadas: 0, rutasRealizadas: 0 },
    });
    prisma.repartidor.delete.mockResolvedValue({ idUser: 1 });

    await expect(service.remove(1)).resolves.toEqual({ idUser: 1 });
  });
});