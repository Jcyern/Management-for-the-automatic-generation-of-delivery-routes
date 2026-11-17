import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { CreateRutaDto, UpdateRutaDto, AsignarRutaDto, ValidarRutaDto, IniciarRutaDto } from './dto/Ruta.dto.js';
import { EstadoRuta } from '../generated/prisma/client.js';

@Injectable()
export class RutaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRutaDto) {
    const { zonasIds, pedidosIds, ...data } = dto;

    const logistico = await this.prisma.logistico.findUnique({ where: { id: dto.idLogistico }});
    if (!logistico) throw new BadRequestException(`El logístico ${dto.idLogistico} no existe.`);

    const reporte = await this.prisma.reporte.findUnique({ where: { id: dto.idReporte }});
    if (!reporte) throw new BadRequestException(`El reporte ${dto.idReporte} no existe.`);

    const rutaConReporte = await this.prisma.ruta.findFirst({ where: { idReporte: dto.idReporte } });
    if (rutaConReporte) throw new BadRequestException(`El reporte ${dto.idReporte} ya está asignado a la ruta ${rutaConReporte.id}.`);

    if (pedidosIds && pedidosIds.length > 0) {
      const pedidos = await this.prisma.pedido.findMany({ where: { id: { in: pedidosIds } } });
      if (pedidos.length !== pedidosIds.length) throw new BadRequestException('Alguno de los pedidos no existe.');
      const centros = new Set(pedidos.map(p => p.idCentro));
      if (centros.size > 1) throw new BadRequestException('No se pueden mezclar pedidos de diferentes centros de distribución en una misma ruta.');
      if (pedidos.some(p => p.idRuta !== null)) throw new BadRequestException('Algunos pedidos ya pertenecen a otra ruta.');
    }

    return this.prisma.ruta.create({
      data: {
        ...data,
        fechaRealizacion: new Date(dto.fechaRealizacion),
        zonasCubiertas: zonasIds ? { connect: zonasIds.map(id => ({ id })) } : undefined,
        pedidos: pedidosIds ? { connect: pedidosIds.map(id => ({ id })) } : undefined,
      },
      include: { logistico: true, zonasCubiertas: true, pedidos: true }
    });
  }

  async findAll() {
    return this.prisma.ruta.findMany({
      include: { 
        logistico: true, 
        zonasCubiertas: true, 
        asignada: true, 
        validada: true 
      },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const ruta = await this.prisma.ruta.findUnique({
      where: { id },
      include: { 
        logistico: true, 
        zonasCubiertas: true, 
        pedidos: true, 
        paradas: true,
        asignada: true,
        validada: true,
        realizada: true
      }
    });
    if (!ruta) throw new NotFoundException(`Ruta ${id} no encontrada`);
    return ruta;
  }

  async update(id: number, dto: UpdateRutaDto) {
    await this.findOne(id);
    const { zonasIds, pedidosIds, fechaRealizacion, ...data } = dto;

    return this.prisma.ruta.update({
      where: { id },
      data: {
        ...data,
        fechaRealizacion: fechaRealizacion ? new Date(fechaRealizacion) : undefined,
        zonasCubiertas: zonasIds ? { set: zonasIds.map(id => ({ id })) } : undefined,
        pedidos: pedidosIds ? { set: pedidosIds.map(id => ({ id })) } : undefined,
      },
      include: { logistico: true, zonasCubiertas: true, pedidos: true }
    });
  }

  async remove(id: number) {
    const ruta = await this.prisma.ruta.findUnique({
      where: { id },
      include: { 
        _count: { select: { pedidos: true, paradas: true } },
        asignada: true,
        validada: true
      }
    });

    if (!ruta) throw new NotFoundException(`Ruta ${id} no encontrada`);

    if (ruta._count.pedidos > 0 || ruta._count.paradas > 0) {
      throw new BadRequestException('No se puede eliminar la ruta porque tiene pedidos o paradas asociadas.');
    }
    if (ruta.asignada || ruta.validada) {
      throw new BadRequestException('No se puede eliminar la ruta porque ya tiene asignaciones o validaciones.');
    }

    return this.prisma.ruta.delete({ where: { id } });
  }

  async asignarRuta(idRuta: number, dto: AsignarRutaDto, idCoordinador: number) {
    const ruta = await this.findOne(idRuta);

    if (ruta.estado !== EstadoRuta.Pendiente) {
      throw new BadRequestException('Solo se pueden asignar rutas en estado Pendiente.');
    }
    if (ruta.asignada) {
      throw new BadRequestException('Esta ruta ya fue asignada a un repartidor.');
    }

    // RF-19: Evitar doble asignación si ya está en la calle (En_Curso)
    const rutasActivas = await this.prisma.asignar.findFirst({
      where: {
        idrepartidor: dto.idRepartidor,
        ruta: { estado: EstadoRuta.En_Curso }
      }
    });
    if (rutasActivas) throw new BadRequestException('El repartidor ya tiene una ruta en curso.');

    return this.prisma.asignar.create({
      data: {
        idRuta: idRuta,
        idcoordinador: idCoordinador,
        idrepartidor: dto.idRepartidor,
        fecha: new Date(dto.fecha),
      },
      include: { repartidor: true, coordinador: true }
    });
  }

  async validarRuta(idRuta: number, dto: ValidarRutaDto, idSupervisor: number) {
    const ruta = await this.findOne(idRuta);

    if (ruta.estado !== EstadoRuta.Pendiente) {
      throw new BadRequestException('Solo se pueden validar rutas en estado Pendiente.');
    }
    if (ruta.validada) throw new BadRequestException('Esta ruta ya fue validada.');

    return this.prisma.validar.create({
      data: {
        idRuta: idRuta,
        idSupervisor: idSupervisor,
        fecha: new Date(dto.fecha),
        observaciones: dto.observaciones,
        aprobadoRechazado: dto.aprobadoRechazado,
      },
      include: { supervisor: true }
    });
  }

  async iniciarRuta(idRuta: number, dto: IniciarRutaDto, idRepartidor: number) {
    const ruta = await this.findOne(idRuta);

    if (ruta.estado !== EstadoRuta.Pendiente) {
      throw new BadRequestException('La ruta no está en estado Pendiente.');
    }
    if (!ruta.validada || !ruta.validada.aprobadoRechazado) {
      throw new BadRequestException('No se puede iniciar una ruta que no ha sido aprobada.');
    }
    if (!ruta.asignada || ruta.asignada.idrepartidor !== idRepartidor) {
      throw new BadRequestException('Esta ruta no está asignada a ti.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.realizar.create({
        data: {
          idRuta: idRuta,
          idRepartidor: idRepartidor,
          idVehiculo: dto.idVehiculo,
        }
      });
      return tx.ruta.update({
        where: { id: idRuta },
        data: { estado: EstadoRuta.En_Curso }
      });
    });
  }

  async terminarRuta(idRuta: number, idRepartidor: number) {
    const ruta = await this.findOne(idRuta);

    if (ruta.estado !== EstadoRuta.En_Curso) {
      throw new BadRequestException('La ruta no está En_Curso.');
    }
    if (!ruta.realizada || ruta.realizada.idRepartidor !== idRepartidor) {
      throw new BadRequestException('No eres el repartidor de esta ruta.');
    }

    return this.prisma.ruta.update({
      where: { id: idRuta },
      data: { estado: EstadoRuta.Terminada }
    });
  }

  private async verificarAutorizacionCentro(centroId: number, userId: number) {
    const centroAutorizado = await this.prisma.centroDeDistribucion.findFirst({
      where: {
        id: centroId,
        OR: [
          { coordinadorCrearRutas: { some: { idUser: userId } } },
          { coordinadorValidadRutas: { some: { idUser: userId } } },
        ],
      },
    });

    if (!centroAutorizado) {
      throw new ForbiddenException(
        'No estás autorizado para ver las rutas de este centro de distribución.'
      );
    }
  }

  async findByCentro(idCentro: number, userId: number) {
    await this.verificarAutorizacionCentro(idCentro, userId);

    const rutas = await this.prisma.ruta.findMany({
      where: {
        logistico: {
          coordinador: {
            centrosCrearRuta: { some: { id: idCentro } }
          }
        }
      },
      include: { 
        logistico: true, 
        zonasCubiertas: true, 
        asignada: true, 
        validada: true 
      }
    });

    return rutas.map(ruta => ({
      ...ruta,
      creadoPorOtroCoordinador: ruta.idLogistico !== userId
    }));
  }

  async getMisRutas(idRepartidor: number) {
    return this.prisma.ruta.findMany({
      where: {
        OR: [
          { asignada: { idrepartidor: idRepartidor } },
          { realizada: { idRepartidor: idRepartidor } }
        ]
      },
      include: { paradas: true, pedidos: true, validada: true, realizada: true }
    });
  }
}