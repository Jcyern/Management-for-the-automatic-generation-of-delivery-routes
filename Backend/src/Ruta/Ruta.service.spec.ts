import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { RutaService } from './Ruta.service.js';
import { EstadoRuta } from '../generated/prisma/client.js';

const prisma = vi.hoisted(() => ({
  ruta: { 
    create: vi.fn(), 
    findMany: vi.fn(), 
    findUnique: vi.fn(), 
    findFirst: vi.fn(),
    update: vi.fn(), 
    delete: vi.fn() 
  },
  logistico: { findUnique: vi.fn() },
  reporte: { findUnique: vi.fn() },
  pedido: { findMany: vi.fn() },
  asignar: { findFirst: vi.fn(), create: vi.fn() },
  validar: { create: vi.fn() },
  realizar: { create: vi.fn() },
  centroDeDistribucion: { findFirst: vi.fn() },
  $transaction: vi.fn(),
}));

describe('RutaService', () => {
  let service: RutaService;

  beforeEach(async () => {
    vi.resetAllMocks();
    
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));

    const module: TestingModule = await Test.createTestingModule({
      providers: [RutaService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(RutaService);
  });

  describe('create', () => {
    const dtoBase = {
      fechaRealizacion: '2026-11-04T10:00:00Z',
      proporcionPedidosTipoEntrega: 50,
      cantidadTotalPedidos: 10,
      idLogistico: 1,
      idReporte: 1,
      pedidosIds: [1, 2],
    };

    it('crea una ruta si todo es válido', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.reporte.findUnique.mockResolvedValue({ id: 1 });
      prisma.ruta.findFirst.mockResolvedValue(null);
      prisma.pedido.findMany.mockResolvedValue([{ id: 1, idRuta: null }, { id: 2, idRuta: null }]);
      prisma.ruta.create.mockResolvedValue({ id: 1 });

      await expect(service.create(dtoBase)).resolves.toBeDefined();
      expect(prisma.ruta.create).toHaveBeenCalled();
    });

    it('lanza error si el logístico no existe', async () => {
      prisma.logistico.findUnique.mockResolvedValue(null);
      await expect(service.create(dtoBase)).rejects.toThrow(BadRequestException);
    });

    it('lanza error si el reporte ya está asignado a otra ruta', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.reporte.findUnique.mockResolvedValue({ id: 1 });
      prisma.ruta.findFirst.mockResolvedValue({ id: 99 });

      await expect(service.create(dtoBase)).rejects.toThrow(BadRequestException);
    });

    it('lanza error si un pedido ya pertenece a otra ruta', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.reporte.findUnique.mockResolvedValue({ id: 1 });
      prisma.ruta.findFirst.mockResolvedValue(null);
      prisma.pedido.findMany.mockResolvedValue([{ id: 1, idRuta: 99 }, { id: 2, idRuta: null }]);

      await expect(service.create(dtoBase)).rejects.toThrow(BadRequestException);
    });
  });

  describe('asignarRuta', () => {
    const dtoAsignar = { idRepartidor: 5, fecha: '2026-11-04T10:00:00Z' };

    it('asigna la ruta si está Pendiente y el repartidor está libre', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1, estado: EstadoRuta.Pendiente, asignada: null });
      prisma.asignar.findFirst.mockResolvedValue(null);
      prisma.asignar.create.mockResolvedValue({ idRuta: 1, idrepartidor: 5 });

      await expect(service.asignarRuta(1, dtoAsignar, 2)).resolves.toBeDefined();
      expect(prisma.asignar.create).toHaveBeenCalled();
    });

    it('lanza error si la ruta ya fue asignada', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1, estado: EstadoRuta.Pendiente, asignada: { idRuta: 1 } });
      await expect(service.asignarRuta(1, dtoAsignar, 2)).rejects.toThrow('Esta ruta ya fue asignada a un repartidor.');
    });

    it('lanza error si el repartidor ya tiene una ruta En_Curso', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1, estado: EstadoRuta.Pendiente, asignada: null });
      prisma.asignar.findFirst.mockResolvedValue({ idRuta: 99 });

      await expect(service.asignarRuta(1, dtoAsignar, 2)).rejects.toThrow('El repartidor ya tiene una ruta en curso.');
    });
  });

  describe('validarRuta', () => {
    const dtoValidar = { fecha: '2026-11-04T10:00:00Z', aprobadoRechazado: true };

    it('registra la validación sin cambiar el estado de la ruta', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1, estado: EstadoRuta.Pendiente, validada: null });
      prisma.validar.create.mockResolvedValue({ idRuta: 1, aprobadoRechazado: true });

      await expect(service.validarRuta(1, dtoValidar, 3)).resolves.toBeDefined();
      expect(prisma.validar.create).toHaveBeenCalled();
      expect(prisma.ruta.update).not.toHaveBeenCalled();
    });

    it('lanza error si la ruta ya fue validada', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1, estado: EstadoRuta.Pendiente, validada: { idRuta: 1 } });
      await expect(service.validarRuta(1, dtoValidar, 3)).rejects.toThrow('Esta ruta ya fue validada.');
    });
  });

  describe('iniciarRuta y terminarRuta', () => {
    it('inicia la ruta: crea el registro Realizar y cambia a En_Curso', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ 
        id: 1, 
        estado: EstadoRuta.Pendiente, 
        validada: { aprobadoRechazado: true }, 
        asignada: { idrepartidor: 5 } 
      });
      prisma.realizar.create.mockResolvedValue({ idRuta: 1 });
      prisma.ruta.update.mockResolvedValue({ id: 1, estado: EstadoRuta.En_Curso });

      await expect(service.iniciarRuta(1, { idVehiculo: 10 }, 5)).resolves.toBeDefined();
      
      expect(prisma.realizar.create).toHaveBeenCalledWith({
        data: { idRuta: 1, idRepartidor: 5, idVehiculo: 10 }
      });
      expect(prisma.ruta.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { estado: EstadoRuta.En_Curso }
      });
    });

    it('no inicia la ruta si no fue aprobada', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ 
        id: 1, 
        estado: EstadoRuta.Pendiente, 
        validada: { aprobadoRechazado: false }, 
        asignada: { idrepartidor: 5 } 
      });

      await expect(service.iniciarRuta(1, { idVehiculo: 10 }, 5)).rejects.toThrow('No se puede iniciar una ruta que no ha sido aprobada.');
    });

    it('no inicia la ruta si el repartidor no es el asignado', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ 
        id: 1, 
        estado: EstadoRuta.Pendiente, 
        validada: { aprobadoRechazado: true }, 
        asignada: { idrepartidor: 4 }
      });

      await expect(service.iniciarRuta(1, { idVehiculo: 10 }, 5)).rejects.toThrow('Esta ruta no está asignada a ti.');
    });

    it('termina la ruta si está En_Curso', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ 
        id: 1, 
        estado: EstadoRuta.En_Curso, 
        realizada: { idRepartidor: 5 } 
      });
      prisma.ruta.update.mockResolvedValue({ id: 1, estado: EstadoRuta.Terminada });

      await expect(service.terminarRuta(1, 5)).resolves.toBeDefined();
      expect(prisma.ruta.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { estado: EstadoRuta.Terminada }
      });
    });
  });

  describe('remove', () => {
    it('no elimina una ruta con pedidos o paradas asociadas', async () => {
      prisma.ruta.findUnique.mockResolvedValue({
        id: 1,
        _count: { pedidos: 1, paradas: 0 },
        asignada: null,
        validada: null
      });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('no elimina una ruta que ya fue asignada o validada', async () => {
      prisma.ruta.findUnique.mockResolvedValue({
        id: 1,
        _count: { pedidos: 0, paradas: 0 },
        asignada: { idRuta: 1 },
        validada: null
      });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('elimina la ruta si no tiene dependencias', async () => {
      prisma.ruta.findUnique.mockResolvedValue({
        id: 1,
        _count: { pedidos: 0, paradas: 0 },
        asignada: null,
        validada: null
      });
      prisma.ruta.delete.mockResolvedValue({ id: 1 });

      await expect(service.remove(1)).resolves.toEqual({ id: 1 });
    });
  });

  describe('findByCentro', () => {
    
    it('lanza error si el usuario no está autorizado en el centro', async () => {
      prisma.centroDeDistribucion.findFirst.mockResolvedValue(null);

      await expect(service.findByCentro(1, 99)).rejects.toThrow(ForbiddenException);
      
      expect(prisma.ruta.findMany).not.toHaveBeenCalled();
    });

    it('devuelve las rutas y marca si fueron creadas por otro coordinador', async () => {
      prisma.centroDeDistribucion.findFirst.mockResolvedValue({ id: 1 });
      
      const rutasSimuladas = [
        { id: 100, idLogistico: 5, estado: 'Pendiente' },
        { id: 101, idLogistico: 8, estado: 'Pendiente' },
      ];
      prisma.ruta.findMany.mockResolvedValue(rutasSimuladas);

      const resultado = await service.findByCentro(1, 5);

      expect(resultado).toHaveLength(2);
      
      expect(resultado![0].creadoPorOtroCoordinador).toBe(false);
      expect(resultado![1].creadoPorOtroCoordinador).toBe(true);
    });
  });
});