import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GrafoService } from '../grafo/grafo.service.js';
import { haversineKm, tiempoEstimadoMin } from '../geo/geo.utils.js';
import type { Coordenadas } from '../geo/geo.types.js';
import type { Criterio } from '../grafo/dto/camino.dto.js';
import { CreateRutaDto, UpdateRutaDto, AsignarRutaDto, ValidarRutaDto, IniciarRutaDto } from './dto/Ruta.dto.js';
import { EstadoRuta } from '../generated/prisma/client.js';

interface PedidoGeneracion {
  id: number;
  idZona: number;
  idCentro: number;
  idRuta: number | null;
  tipoEntrega: string;
  latitud: number | null;
  longitud: number | null;
}

interface Tramo {
  distanciaKm: number;
  tiempoMin: number;
}

interface ParadaPlan {
  pedidoId: number;
  orden: number;
  distanciaDesdeAnteriorKm: number;
  tiempoEstimadoMin: number;
}

@Injectable()
export class RutaService {
  constructor(
    private prisma: PrismaService,
    private grafoService: GrafoService,
  ) {}

  /**
   * Crea una ruta generada automáticamente a partir de los pedidos indicados.
   *
   * Valida logístico, pedidos (existencia, mismo centro, sin ruta asignada y con
   * coordenadas), centro con coordenadas y reporte opcional. Calcula zonas
   * cubiertas y métricas de la ruta, y determina el orden de visita con una
   * heurística voraz (vecino más cercano) usando un motor híbrido: costos entre
   * zonas desde Neo4j y distancias Haversine para tramos desde el centro o
   * dentro de la misma zona (con fallback Haversine si no hay camino inter-zona).
   *
   * Persiste en una transacción la ruta, su vínculo con pedidos/zonas y una
   * parada nueva por pedido con orden y métricas desde la ubicación anterior.
   */
  async create(dto: CreateRutaDto) {
    const criterio: Criterio = dto.criterio ?? 'distancia';
    const pedidosIds = [...new Set(dto.pedidosIds)];

    const [logistico, pedidos] = await Promise.all([
      this.prisma.logistico.findUnique({ where: { id: dto.idLogistico } }),
      this.prisma.pedido.findMany({
        where: { id: { in: pedidosIds } },
        select: {
          id: true,
          idZona: true,
          idCentro: true,
          idRuta: true,
          tipoEntrega: true,
          latitud: true,
          longitud: true,
        },
      }),
    ]);

    if (!logistico) throw new BadRequestException(`El logístico ${dto.idLogistico} no existe.`);

    if (pedidos.length !== pedidosIds.length) {
      const encontrados = new Set(pedidos.map((p) => p.id));
      const faltantes = pedidosIds.filter((id) => !encontrados.has(id));
      throw new BadRequestException(`Pedidos no encontrados: ${faltantes.join(', ')}.`);
    }

    const centros = [...new Set(pedidos.map((p) => p.idCentro))];
    if (centros.length !== 1) {
      throw new BadRequestException('No se pueden mezclar pedidos de diferentes centros de distribución en una misma ruta.');
    }
    const idCentro = centros[0]!;
    if (dto.idCentro !== undefined && dto.idCentro !== idCentro) {
      throw new BadRequestException('El centro indicado no coincide con el centro de los pedidos.');
    }

    if (pedidos.some((p) => p.idRuta !== null)) {
      throw new BadRequestException('Algunos pedidos ya pertenecen a otra ruta.');
    }

    const centro = await this.prisma.centroDeDistribucion.findUnique({ where: { id: idCentro } });
    if (!centro) throw new BadRequestException(`El centro ${idCentro} no existe.`);

    if (centro.latitud == null || centro.longitud == null) {
      throw new BadRequestException('El centro no tiene coordenadas. Actualiza su ubicación antes de generar rutas.');
    }
    const sinCoords = pedidos.filter((p) => p.latitud == null || p.longitud == null).map((p) => p.id);
    if (sinCoords.length > 0) {
      throw new BadRequestException(`Los pedidos sin coordenadas no pueden incluirse en la ruta: ${sinCoords.join(', ')}.`);
    }

    if (dto.idReporte !== undefined) {
      const reporte = await this.prisma.reporte.findUnique({ where: { id: dto.idReporte } });
      if (!reporte) throw new BadRequestException(`El reporte ${dto.idReporte} no existe.`);
      const rutaConReporte = await this.prisma.ruta.findFirst({ where: { idReporte: dto.idReporte } });
      if (rutaConReporte) throw new BadRequestException(`El reporte ${dto.idReporte} ya está asignado a la ruta ${rutaConReporte.id}.`);
    }

    const centroCoords: Coordenadas = { latitud: centro.latitud, longitud: centro.longitud };
    const zonasPedidos = [...new Set(pedidos.map((p) => p.idZona))];
    const costosZonas = await this.grafoService.matrizCostos(zonasPedidos, criterio);
    const costosMap = this.construirMapaCostos(costosZonas);

    const plan = this.ordenarPedidos(pedidos as PedidoGeneracion[], centroCoords, costosMap, criterio);

    const zonasCubiertas = zonasPedidos.map((id) => ({ id }));
    const cantidadTotalPedidos = pedidos.length;
    const clasificados = pedidos.filter((p) => p.tipoEntrega !== 'Sin_Clasificar').length;
    const proporcionPedidosTipoEntrega = Math.max(1, Math.round((clasificados / cantidadTotalPedidos) * 100));

    return this.prisma.$transaction(async (tx) => {
      const ruta = await tx.ruta.create({
        data: {
          fechaRealizacion: new Date(dto.fechaRealizacion),
          proporcionPedidosTipoEntrega,
          cantidadTotalPedidos,
          idLogistico: dto.idLogistico,
          ...(dto.idReporte !== undefined ? { idReporte: dto.idReporte } : {}),
          zonasCubiertas: { connect: zonasCubiertas },
          pedidos: { connect: pedidosIds.map((id) => ({ id })) },
        },
      });

      for (const parada of plan) {
        await tx.parada.create({
          data: {
            orden: parada.orden,
            distanciaDesdeAnteriorKm: parada.distanciaDesdeAnteriorKm,
            tiempoEstimadoMin: parada.tiempoEstimadoMin,
            pedidoAsociados: { connect: { id: parada.pedidoId } },
            rutas: { connect: { id: ruta.id } },
          },
        });
      }

      return tx.ruta.findUnique({
        where: { id: ruta.id },
        include: {
          logistico: true,
          zonasCubiertas: true,
          pedidos: true,
          paradas: { orderBy: { orden: 'asc' }, include: { pedidoAsociados: true } },
        },
      });
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
        paradas: { orderBy: { orden: 'asc' } },
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
    const { zonasIds, pedidosIds, fechaRealizacion, idReporte, ...data } = dto;

    // Si se asigna un reporte, debe existir y no estar usado por otra ruta.
    if (idReporte !== undefined) {
      const reporte = await this.prisma.reporte.findUnique({ where: { id: idReporte } });
      if (!reporte) throw new BadRequestException(`El reporte ${idReporte} no existe.`);

      const rutaConReporte = await this.prisma.ruta.findFirst({ where: { idReporte, NOT: { id } } });
      if (rutaConReporte) throw new BadRequestException(`El reporte ${idReporte} ya está asignado a la ruta ${rutaConReporte.id}.`);
    }

    return this.prisma.ruta.update({
      where: { id },
      data: {
        ...data,
        ...(idReporte !== undefined ? { idReporte } : {}),
        ...(fechaRealizacion ? { fechaRealizacion: new Date(fechaRealizacion) } : {}),
        ...(zonasIds ? { zonasCubiertas: { set: zonasIds.map(id => ({ id })) } } : {}),
        ...(pedidosIds ? { pedidos: { set: pedidosIds.map(id => ({ id })) } } : {}),
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
        observaciones: dto.observaciones ?? null,
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
      include: {
        paradas: { orderBy: { orden: 'asc' } },
        pedidos: true,
        validada: true,
        realizada: true,
      }
    });
  }

  /** Indexa los costos inter-zona en un mapa simétrico para consulta O(1). */
  private construirMapaCostos(costos: Array<{ origen: number; destino: number; costo: number; distanciaKm: number; tiempoMin: number }>): Map<string, { costo: number; distanciaKm: number; tiempoMin: number }> {
    const mapa = new Map<string, { costo: number; distanciaKm: number; tiempoMin: number }>();
    for (const c of costos) {
      const valor = { costo: c.costo, distanciaKm: c.distanciaKm, tiempoMin: c.tiempoMin };
      mapa.set(`${c.origen}-${c.destino}`, valor);
      mapa.set(`${c.destino}-${c.origen}`, valor);
    }
    return mapa;
  }

  /**
   * Calcula el costo y las métricas de un tramo hacia un pedido.
   * Usa Haversine desde el centro o dentro de la misma zona; entre zonas
   * distintas usa el costo del grafo y recurre a Haversine si no existe camino.
   */
  private tramoEntre(
    desde: { coords: Coordenadas; idZona: number | null; esCentro: boolean },
    hasta: PedidoGeneracion,
    costosZonas: Map<string, { costo: number; distanciaKm: number; tiempoMin: number }>,
    criterio: Criterio,
  ): { costo: number } & Tramo {
    const hastaCoords: Coordenadas = { latitud: hasta.latitud!, longitud: hasta.longitud! };
    const usarHaversine = desde.esCentro || desde.idZona === null || desde.idZona === hasta.idZona;

    if (usarHaversine) {
      const distanciaKm = haversineKm(desde.coords, hastaCoords);
      const tiempoMin = tiempoEstimadoMin(distanciaKm);
      return {
        costo: criterio === 'distancia' ? distanciaKm : tiempoMin,
        distanciaKm,
        tiempoMin,
      };
    }

    const key = `${desde.idZona}-${hasta.idZona}`;
    const interZona = costosZonas.get(key);
    if (interZona) {
      return {
        costo: interZona.costo,
        distanciaKm: interZona.distanciaKm,
        tiempoMin: Math.max(1, Math.round(interZona.tiempoMin)),
      };
    }

    // Fallback: si Neo4j no tiene camino entre zonas, usa Haversine
    const distanciaKm = haversineKm(desde.coords, hastaCoords);
    const tiempoMinVal = tiempoEstimadoMin(distanciaKm);
    return {
      costo: criterio === 'distancia' ? distanciaKm : tiempoMinVal,
      distanciaKm,
      tiempoMin: tiempoMinVal,
    };
  }

  /**
   * Ordena los pedidos con una heurística de vecino más cercano partiendo del
   * centro y construye el plan de paradas con su orden y métricas acumulables
   * respecto a la ubicación anterior.
   */
  private ordenarPedidos(
    pedidos: PedidoGeneracion[],
    centroCoords: Coordenadas,
    costosZonas: Map<string, { costo: number; distanciaKm: number; tiempoMin: number }>,
    criterio: Criterio,
  ): ParadaPlan[] {
    const restantes = [...pedidos];
    const plan: ParadaPlan[] = [];
    let actual: { coords: Coordenadas; idZona: number | null; esCentro: boolean } = {
      coords: centroCoords,
      idZona: null,
      esCentro: true,
    };
    let orden = 1;

    while (restantes.length > 0) {
      let mejorIdx = 0;
      let mejorTramo = this.tramoEntre(actual, restantes[0]!, costosZonas, criterio);

      for (let i = 1; i < restantes.length; i++) {
        const tramo = this.tramoEntre(actual, restantes[i]!, costosZonas, criterio);
        if (tramo.costo < mejorTramo.costo) {
          mejorTramo = tramo;
          mejorIdx = i;
        }
      }

      const elegido = restantes.splice(mejorIdx, 1)[0]!;
      plan.push({
        pedidoId: elegido.id,
        orden,
        distanciaDesdeAnteriorKm: Math.round(mejorTramo.distanciaKm * 1000) / 1000,
        tiempoEstimadoMin: mejorTramo.tiempoMin,
      });
      actual = {
        coords: { latitud: elegido.latitud!, longitud: elegido.longitud! },
        idZona: elegido.idZona,
        esCentro: false,
      };
      orden++;
    }

    return plan;
  }
}