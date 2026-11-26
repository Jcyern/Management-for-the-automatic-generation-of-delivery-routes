import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Zona } from '../../../domain/Zona.js';
import type { PrismaService } from '../../../../../prismaModule/prisma.service.js';
import { PrismaZonaRepository } from './PrismaZonaRepository.js';

function crearPrismaMock() {
  return {
    zona: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('PrismaZonaRepository', () => {
  let prisma: ReturnType<typeof crearPrismaMock>;
  let repo: PrismaZonaRepository;

  beforeEach(() => {
    prisma = crearPrismaMock();
    repo = new PrismaZonaRepository(prisma as unknown as PrismaService);
  });

  it('guardar con id nulo crea la zona', async () => {
    prisma.zona.create.mockResolvedValue({ id: 10, nombre: 'Norte' });

    const salida = await repo.guardar(Zona.crear('Norte'));

    expect(prisma.zona.create).toHaveBeenCalledWith({
      data: { nombre: 'Norte' },
    });
    expect(salida.id).toBe(10);
    expect(salida.nombre).toBe('Norte');
  });

  it('guardar con id actualiza la zona', async () => {
    prisma.zona.update.mockResolvedValue({ id: 10, nombre: 'Sur' });

    await repo.guardar(Zona.rehidratar({ id: 10, nombre: 'Sur' }));

    expect(prisma.zona.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { nombre: 'Sur' },
    });
  });

  it('buscarPorId devuelve null si no existe', async () => {
    prisma.zona.findUnique.mockResolvedValue(null);

    expect(await repo.buscarPorId(99)).toBeNull();
  });

  it('buscarPorId rehidrata la zona', async () => {
    prisma.zona.findUnique.mockResolvedValue({ id: 1, nombre: 'Centro' });

    const zona = await repo.buscarPorId(1);

    expect(zona?.id).toBe(1);
    expect(zona?.nombre).toBe('Centro');
  });

  it('listar mapea las filas', async () => {
    prisma.zona.findMany.mockResolvedValue([
      { id: 1, nombre: 'Norte' },
      { id: 2, nombre: 'Sur' },
    ]);

    const zonas = await repo.listar();

    expect(prisma.zona.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
    expect(zonas.map((zona) => zona.nombre)).toEqual(['Norte', 'Sur']);
  });

  it('tieneDependencias devuelve false si la zona no existe', async () => {
    prisma.zona.findUnique.mockResolvedValue(null);

    expect(await repo.tieneDependencias(1)).toBe(false);
  });

  it('tieneDependencias devuelve false sin pedidos ni rutas', async () => {
    prisma.zona.findUnique.mockResolvedValue({
      _count: { pedidos: 0, rutas: 0 },
    });

    expect(await repo.tieneDependencias(1)).toBe(false);
  });

  it('tieneDependencias devuelve true si hay pedidos', async () => {
    prisma.zona.findUnique.mockResolvedValue({
      _count: { pedidos: 1, rutas: 0 },
    });

    expect(await repo.tieneDependencias(1)).toBe(true);
  });

  it('tieneDependencias devuelve true si hay rutas', async () => {
    prisma.zona.findUnique.mockResolvedValue({
      _count: { pedidos: 0, rutas: 1 },
    });

    expect(await repo.tieneDependencias(1)).toBe(true);
  });

  it('eliminar borra y devuelve la zona', async () => {
    prisma.zona.delete.mockResolvedValue({ id: 1, nombre: 'Norte' });

    const eliminada = await repo.eliminar(1);

    expect(prisma.zona.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(eliminada.nombre).toBe('Norte');
  });
});
