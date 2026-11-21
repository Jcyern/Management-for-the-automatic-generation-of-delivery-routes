import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GrafoService } from '../grafo/grafo.service.js';
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
  centroDeDistribucion: { findFirst: vi.fn(), findUnique: vi.fn() },
  parada: { create: vi.fn() },
  $transaction: vi.fn(),
}));

const grafo = vi.hoisted(() => ({
  matrizCostos: vi.fn(),
}));

describe('RutaService', () => {
  let service: RutaService;

  beforeEach(async () => {
    vi.resetAllMocks();
    
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RutaService,
        { provide: PrismaService, useValue: prisma },
        { provide: GrafoService, useValue: grafo },
      ],
    }).compile();
    service = module.get(RutaService);
  });

  describe('create', () => {
    const dtoBase = {
      fechaRealizacion: '2026-11-04T10:00:00Z',
      idLogistico: 1,
      idReporte: 1,
      pedidosIds: [1, 2],
    };

    const centro = { id: 10, latitud: 23.1, longitud: -82.3 };
    const pedido = (id: number, overrides: Record<string, unknown> = {}) => ({
      id,
      idZona: 1,
      idCentro: 10,
      idRuta: null,
      tipoEntrega: 'Paqueteria',
      latitud: 23.11,
      longitud: -82.31,
      ...overrides,
    });

    it('crea una ruta automáticamente si todo es válido', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2, { latitud: 23.12, longitud: -82.32 })]);
      prisma.centroDeDistribucion.findUnique.mockResolvedValue(centro);
      prisma.reporte.findUnique.mockResolvedValue({ id: 1 });
      prisma.ruta.findFirst.mockResolvedValue(null);
      grafo.matrizCostos.mockResolvedValue([]);
      prisma.ruta.create.mockResolvedValue({ id: 7 });
      prisma.parada.create.mockResolvedValue({});
      prisma.ruta.findUnique.mockResolvedValue({ id: 7, paradas: [], pedidos: [], zonasCubiertas: [] });

      await expect(service.create(dtoBase)).resolves.toEqual({ id: 7, paradas: [], pedidos: [], zonasCubiertas: [] });

      expect(grafo.matrizCostos).toHaveBeenCalledWith([1], 'distancia');
      expect(prisma.ruta.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            idLogistico: 1,
            idReporte: 1,
            cantidadTotalPedidos: 2,
            zonasCubiertas: { connect: [{ id: 1 }] },
            pedidos: { connect: [{ id: 1 }, { id: 2 }] },
          }),
        }),
      );
      expect(prisma.parada.create).toHaveBeenCalledTimes(2);
      expect(prisma.parada.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orden: 1,
            rutas: { connect: { id: 7 } },
            pedidoAsociados: { connect: { id: expect.any(Number) } },
          }),
        }),
      );
    });

    it('crea una ruta sin reporte y no consulta Reporte', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2)]);
      prisma.centroDeDistribucion.findUnique.mockResolvedValue(centro);
      grafo.matrizCostos.mockResolvedValue([]);
      prisma.ruta.create.mockResolvedValue({ id: 7 });
      prisma.parada.create.mockResolvedValue({});
      prisma.ruta.findUnique.mockResolvedValue({ id: 7 });

      const sinReporte = {
        fechaRealizacion: dtoBase.fechaRealizacion,
        idLogistico: dtoBase.idLogistico,
        pedidosIds: dtoBase.pedidosIds,
      };

      await expect(service.create(sinReporte)).resolves.toBeDefined();
      expect(prisma.reporte.findUnique).not.toHaveBeenCalled();
      expect(prisma.ruta.findFirst).not.toHaveBeenCalled();
      expect(prisma.ruta.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ idReporte: expect.anything() }),
        }),
      );
    });

    it('lanza error si el logístico no existe', async () => {
      prisma.logistico.findUnique.mockResolvedValue(null);
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2)]);

      await expect(service.create(dtoBase)).rejects.toThrow('El logístico 1 no existe.');
    });

    it('lanza error si el reporte ya está asignado a otra ruta', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2)]);
      prisma.centroDeDistribucion.findUnique.mockResolvedValue(centro);
      prisma.reporte.findUnique.mockResolvedValue({ id: 1 });
      prisma.ruta.findFirst.mockResolvedValue({ id: 99 });

      await expect(service.create(dtoBase)).rejects.toThrow('El reporte 1 ya está asignado a la ruta 99.');
      expect(prisma.ruta.create).not.toHaveBeenCalled();
    });

    it('lanza error si un pedido ya pertenece a otra ruta', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1, { idRuta: 99 }), pedido(2)]);
      prisma.centroDeDistribucion.findUnique.mockResolvedValue(centro);

      await expect(service.create(dtoBase)).rejects.toThrow('Algunos pedidos ya pertenecen a otra ruta.');
      expect(prisma.ruta.create).not.toHaveBeenCalled();
    });

    it('lanza error si los pedidos son de centros distintos', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2, { idCentro: 11 })]);

      await expect(service.create(dtoBase)).rejects.toThrow(
        'No se pueden mezclar pedidos de diferentes centros de distribución en una misma ruta.',
      );
    });

    it('lanza error si el centro no tiene coordenadas', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2)]);
      prisma.centroDeDistribucion.findUnique.mockResolvedValue({ id: 10, latitud: null, longitud: null });

      await expect(service.create(dtoBase)).rejects.toThrow(
        'El centro no tiene coordenadas. Actualiza su ubicación antes de generar rutas.',
      );
    });

    it('lanza error si algún pedido no tiene coordenadas', async () => {
      prisma.logistico.findUnique.mockResolvedValue({ id: 1 });
      prisma.pedido.findMany.mockResolvedValue([pedido(1), pedido(2, { latitud: null, longitud: null })]);
      prisma.centroDeDistribucion.findUnique.mockResolvedValue(centro);

      await expect(service.create(dtoBase)).rejects.toThrow(
        'Los pedidos sin coordenadas no pueden incluirse en la ruta: 2.',
      );
    });
  });

  describe('update', () => {
    it('lanza error si el reporte a asignar no existe', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1 });
      prisma.reporte.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { idReporte: 99 })).rejects.toThrow('El reporte 99 no existe.');
      expect(prisma.ruta.update).not.toHaveBeenCalled();
    });

    it('lanza error si el reporte ya está asignado a otra ruta', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1 });
      prisma.reporte.findUnique.mockResolvedValue({ id: 5 });
      prisma.ruta.findFirst.mockResolvedValue({ id: 99 });

      await expect(service.update(1, { idReporte: 5 })).rejects.toThrow(BadRequestException);
      expect(prisma.ruta.update).not.toHaveBeenCalled();
    });

    it('asigna el reporte si es válido', async () => {
      prisma.ruta.findUnique.mockResolvedValue({ id: 1 });
      prisma.reporte.findUnique.mockResolvedValue({ id: 5 });
      prisma.ruta.findFirst.mockResolvedValue(null);
      prisma.ruta.update.mockResolvedValue({ id: 1 });

      await expect(service.update(1, { idReporte: 5 })).resolves.toBeDefined();
      expect(prisma.ruta.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ idReporte: 5 }) }),
      );
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
      
      expect(resultado![0]!.creadoPorOtroCoordinador).toBe(false);
      expect(resultado![1]!.creadoPorOtroCoordinador).toBe(true);
    });
  });
});