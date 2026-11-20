import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { GeocodingService } from '../geo/geocoding.service.js';
import type { Coordenadas } from '../geo/geo.types.js';
import { CreateCentroDto, UpdateCentroDto } from './dto/Centro.dto.js';

interface UbicacionCentro {
  latitud: number | null;
  longitud: number | null;
}

@Injectable()
export class CentroService {
  constructor(
    private prisma: PrismaService,
    private readonly geocoding: GeocodingService,
  ) {}

  // Comprueba si el coordinador está autorizado para gestionar este centro
  private async verificarAutorizacion(centroId: number, userId: number) {
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
        'No estás autorizado para gestionar este centro de distribución.',
      );
    }
  }

  async create(dto: CreateCentroDto, userId: number) {
    const { zonasIds, direccion, latitud, longitud, ...data } = dto;

    // Comprueba que el nombre sea único
    const existeNombre = await this.prisma.centroDeDistribucion.findFirst({
      where: { nombre: data.nombre },
    });
    if (existeNombre) {
      throw new ConflictException(
        `Ya existe un centro con el nombre ${data.nombre}`,
      );
    }

    const ubicacion = await this.resolverUbicacion(
      direccion,
      latitud,
      longitud,
      true,
    );
    if (!ubicacion) {
      throw new BadRequestException(
        'Debes indicar una dirección o las coordenadas del centro.',
      );
    }

    // Crea el centro, asocia zonas y auto-asigna al coordinador creador
    return this.prisma.centroDeDistribucion.create({
      data: {
        ...data,
        ...(direccion !== undefined ? { direccion } : {}),
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        ...(zonasIds !== undefined
          ? { zonas: { connect: zonasIds.map((id) => ({ id })) } }
          : {}),
        coordinadorCrearRutas: { connect: { idUser: userId } },
      },
      include: { zonas: true },
    });
  }

  async findAll(userId: number) {
    // Filtra para que el coordinador solo vea los centros donde está autorizado
    return this.prisma.centroDeDistribucion.findMany({
      where: {
        OR: [
          { coordinadorCrearRutas: { some: { idUser: userId } } },
          { coordinadorValidadRutas: { some: { idUser: userId } } },
        ],
      },
      include: { zonas: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const centro = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      include: { zonas: true },
    });
    if (!centro) throw new NotFoundException(`Centro ${id} not found`);
    return centro;
  }

  async update(id: number, dto: UpdateCentroDto, userId: number) {
    await this.findOne(id);
    await this.verificarAutorizacion(id, userId);

    const { zonasIds, direccion, latitud, longitud, ...data } = dto;

    // Valida que el nombre sea único en caso de que se intente cambiar
    if (data.nombre) {
      const existeNombre = await this.prisma.centroDeDistribucion.findFirst({
        where: { nombre: data.nombre, id: { not: id } },
      });
      if (existeNombre) {
        throw new ConflictException(
          `Ya existe otro centro con el nombre ${data.nombre}`,
        );
      }
    }

    const ubicacion = await this.resolverUbicacion(
      direccion,
      latitud,
      longitud,
      false,
    );

    return this.prisma.centroDeDistribucion.update({
      where: { id },
      data: {
        ...data,
        ...(direccion !== undefined ? { direccion } : {}),
        ...(ubicacion !== undefined
          ? { latitud: ubicacion.latitud, longitud: ubicacion.longitud }
          : {}),
        ...(zonasIds !== undefined
          ? { zonas: { set: zonasIds.map((id) => ({ id })) } }
          : {}),
      },
      include: { zonas: true },
    });
  }

  /**
   * Resuelve la ubicación de un centro a partir de una dirección o de
   * coordenadas explícitas. Si no se envía ninguna ubicación y no es
   * obligatoria, devuelve `undefined` para no modificar los datos actuales.
   */
  private async resolverUbicacion(
    direccion: string | undefined,
    latitud: number | undefined,
    longitud: number | undefined,
    requerida: boolean,
  ): Promise<UbicacionCentro | undefined> {
    if ((latitud == null) !== (longitud == null)) {
      throw new BadRequestException('Debes enviar latitud y longitud juntas.');
    }

    if (latitud != null && longitud != null) {
      return { latitud, longitud };
    }

    if (!direccion) {
      if (requerida) {
        throw new BadRequestException(
          'Debes indicar una dirección o las coordenadas del centro.',
        );
      }
      return undefined;
    }

    const coordenadas: Coordenadas | null =
      await this.geocoding.geocodificar(direccion);

    if (!coordenadas) {
      if (this.geocoding.modoEstricto) {
        throw new UnprocessableEntityException(
          `No se pudo obtener la ubicación para la dirección "${direccion}". Verifícala e intenta de nuevo.`,
        );
      }
      // En modo tolerante se limpian las coordenadas para no dejar una
      // ubicación antigua asociada a una dirección nueva.
      return { latitud: null, longitud: null };
    }

    return coordenadas;
  }

  async remove(id: number, userId: number) {
    // Comprueba que no tenga pedidos ni repartidores asociados antes de borrarlo
    const centro = await this.prisma.centroDeDistribucion.findUnique({
      where: { id },
      include: { _count: { select: { pedidos: true, repartidores: true } } },
    });

    if (!centro) throw new NotFoundException(`Centro ${id} not found`);

    await this.verificarAutorizacion(id, userId);

    if (centro._count.pedidos > 0 || centro._count.repartidores > 0) {
      throw new BadRequestException(
        `No se puede eliminar el centro porque tiene pedidos o repartidores asociados.`,
      );
    }

    return this.prisma.centroDeDistribucion.delete({
      where: { id },
    });
  }
}
