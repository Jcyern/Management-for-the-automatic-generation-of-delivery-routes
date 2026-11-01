import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { ZonaService } from './Zona.service.js';

const prisma = vi.hoisted(() => ({
  zona: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ZonaService', () => {
  let service: ZonaService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZonaService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ZonaService);
  });

  it('lanza NotFoundException al buscar una zona inexistente', async () => {
    prisma.zona.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza NotFoundException al eliminar una zona inexistente', async () => {
    prisma.zona.findUnique.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no elimina una zona con pedidos o rutas asociadas', async () => {
    prisma.zona.findUnique.mockResolvedValue({
      id: 1,
      _count: { pedidos: 2, rutas: 0 },
    });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.zona.delete).not.toHaveBeenCalled();
  });

  it('elimina la zona cuando no tiene dependencias', async () => {
    prisma.zona.findUnique.mockResolvedValue({
      id: 1,
      _count: { pedidos: 0, rutas: 0 },
    });
    prisma.zona.delete.mockResolvedValue({ id: 1 });

    await expect(service.remove(1)).resolves.toEqual({ id: 1 });
    expect(prisma.zona.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});